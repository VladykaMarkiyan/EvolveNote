from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from flask_cors import CORS
import os
from groq import Groq
import json
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_for_dev')
jwt = JWTManager(app)

# --- CORS ---
CORS(app, resources={r"/*": {"origins": "*"}})

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

db = SQLAlchemy(app)

# --- ERROR HANDLER ---
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": str(e)}), 500

# --- MODELS ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)
    created_at = db.Column(db.String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    last_login_at = db.Column(db.String, nullable=True)
    goals = db.relationship('Goal', backref='owner', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at
        }

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    # --- НОВЕ ПОЛЕ ДЛЯ АРХІВУ ---
    is_archived = db.Column(db.Boolean, default=False) 
    
    tasks = db.relationship('Task', backref='goal', lazy=True, cascade="all, delete-orphan")

    def to_json(self):
        return {
            'id': str(self.id),
            'text': self.title,
            'start_date': self.start_date.strftime("%Y-%m-%d") if self.start_date else None,
            'end_date': self.end_date.strftime("%Y-%m-%d") if self.end_date else None,
            'author': self.owner.username if self.owner else "Unknown",
            'created_at': self.created_at.strftime("%d/%m/%Y %H:%M:%S"),
            'is_archived': self.is_archived, # <--- ВІДДАЄМО СТАТУС НА ФРОНТЕНД
            'tasks': [task.to_json() for task in self.tasks] 
        }

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    done = db.Column(db.Boolean, default=False)  
    last_done_at = db.Column(db.DateTime, nullable=True)
    frequency = db.Column(db.String(20), nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    # НОВЕ ПОЛЕ: Рахує кількість успішних виконань за всі дні
    completed_count = db.Column(db.Integer, default=0) 

    def to_json(self):
        now = datetime.now()
        today = now.date()
        is_odd_day = today.day % 2 != 0 
        
        # 1. ПЕРЕВІРКА: Чи настав день старту цілі?
        goal_started = True
        if self.goal and self.goal.start_date:
            if today < self.goal.start_date.date():
                goal_started = False
                
        # 2. СТАН ГАЛОЧКИ НА СЬОГОДНІ
        display_done = self.done
        is_done_today = False
        is_done_this_week = False

        if self.last_done_at:
            last_date = self.last_done_at.date()
            if last_date == today:
                is_done_today = True

            if self.frequency in ['daily', 'odd', 'even']:
                if last_date < today:
                    display_done = False
            elif self.frequency == 'weekly':
                if last_date.isocalendar()[:2] == today.isocalendar()[:2]:
                    is_done_this_week = True
                else:
                    display_done = False

        # 3. РОЗУМНА ВИДИМІСТЬ
        is_active = False
        
        # Таски стають видимими ТІЛЬКИ якщо ціль вже стартувала
        if goal_started:
            if self.frequency == 'daily':
                is_active = True
            elif self.frequency == 'odd' and is_odd_day:
                is_active = True
            elif self.frequency == 'even' and not is_odd_day:
                is_active = True
            elif self.frequency == 'weekly':
                if not is_done_this_week or is_done_today:
                    is_active = True

        return {
            'id': self.id,
            'text': self.name,
            'done': display_done,
            'is_active': is_active,
            'frequency': self.frequency,
            'completed_count': self.completed_count or 0
        }

# --- МАРШРУТ КЛІКУ ПО ТАСЦІ ---
@app.route('/tasks/<int:task_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_task(task_id):
    task = Task.query.get(task_id)
    if not task: return jsonify({'error': 'Task not found'}), 404
    
    now = datetime.now()
    today = now.date()
    
    # Перевіряємо, чи таска ВЖЕ виконана в поточному періоді
    is_done_recently = False
    if task.done and task.last_done_at:
        last_date = task.last_done_at.date()
        if task.frequency in ['daily', 'odd', 'even'] and last_date == today:
            is_done_recently = True
        elif task.frequency == 'weekly' and last_date.isocalendar()[:2] == today.isocalendar()[:2]:
            is_done_recently = True
            
    if is_done_recently:
        # Відміняємо: знімаємо галочку і віднімаємо 1 з лічильника
        task.done = False
        task.completed_count = max(0, (task.completed_count or 0) - 1)
    else:
        # Виконуємо: ставимо галочку, фіксуємо час і додаємо +1
        task.done = True
        task.last_done_at = now
        task.completed_count = (task.completed_count or 0) + 1
        
    db.session.commit()
    return jsonify(task.to_json()), 200



# --- ROUTES ---
@app.route('/')
def home():
    return jsonify({"message": "API EvolveNote працює!"}), 200

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "Бекенд на зв'язку!"}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': "Email та пароль обов'язкові"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Користувач з таким email вже існує'}), 409

    # ФІКС: Відразу ставимо дату першого входу при реєстрації
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    new_user = User(
        email=data['email'], 
        username=data.get('username'),
        last_login_at=now_str  # <--- ЗАПИСУЄМО ЧАС СТВОРЕННЯ
    )
    new_user.set_password(data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id))

        return jsonify({
            'message': 'Успішна реєстрація!',
            'user': new_user.to_json(),
            'access_token': access_token,
            'is_first_login': True  # Після реєстрації ЗАВЖДИ показуємо онбордінг
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Дані не отримано'}), 400

    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        # ПЕРЕВІРКА: Оскільки реєстрація вже поставила дату, 
        # при першому ж логіні is_first_login стане False.
        is_first_login = user.last_login_at is None 
        
        goals_count = len(user.goals)
        
        # Оновлюємо дату останнього входу
        user.last_login_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'Вхід успішний',
            'user': user.to_json(),
            'access_token': access_token,
            'is_first_login': is_first_login, # Тепер тут буде False на 2-й вхід
            'has_goals': goals_count > 0
        }), 200

    return jsonify({'error': 'Невірний email або пароль'}), 401

# --- GOALS ---
@app.route('/goals', methods=['GET'])
@jwt_required()
def get_goals():
    current_user_id = get_jwt_identity()
    goals = Goal.query.filter_by(user_id=current_user_id).order_by(Goal.created_at.desc()).all()

    # --- АВТОМАТИЧНА СИНХРОНІЗАЦІЯ АРХІВУ ---
    # Якщо дедлайн цілі минув, а в базі вона ще числиться активною - оновлюємо БД!
    now_date = datetime.now().date()
    db_changed = False
    
    for g in goals:
        if not g.is_archived and g.end_date:
            if g.end_date.date() < now_date:
                g.is_archived = True
                db_changed = True
                
    if db_changed:
        db.session.commit() # Зберігаємо зміни, якщо когось "перекинули" в архів
    # ----------------------------------------

    return jsonify([g.to_json() for g in goals]), 200

@app.route('/goals', methods=['POST'])
@jwt_required()
def create_goal():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    active_goals_count = Goal.query.filter_by(user_id=current_user_id, is_archived=False).count()
    if active_goals_count >= 3:
        return jsonify({'error': "Ви досягли ліміту в 3 цілі. Оновіть підписку до Premium!"}), 403

    title = data.get('title')
    if not title:
        return jsonify({'error': 'Title обов’язковий'}), 400

    # 1. ЧИСТА ДАТА СТАРТУ (Без Timezones)
    try:
        raw_start = data.get('start_date')
        if "T" in raw_start: # Підстраховка
            raw_start = raw_start.split("T")[0]
        start_date = datetime.strptime(raw_start, "%Y-%m-%d")
    except Exception:
        return jsonify({'error': 'Невірний формат start_date'}), 400

    # Перевірка (з толерантністю 1 день)
    if start_date.date() < (datetime.now() - timedelta(days=1)).date():
        return jsonify({'error': 'Початкова дата не може бути в минулому'}), 400

    # 2. ЧИСТА ДАТА КІНЦЯ
    end_date = None
    if data.get('end_date'):
        try:
            raw_end = data.get('end_date')
            if "T" in raw_end:
                raw_end = raw_end.split("T")[0]
            end_date = datetime.strptime(raw_end, "%Y-%m-%d")
        except Exception:
            return jsonify({'error': 'Невірний формат end_date'}), 400
    else:
        try:
            days = int(data.get('duration_days') or 0)
            months = int(data.get('duration_months') or 0)
        except ValueError:
            return jsonify({'error': 'Тривалість має бути числом'}), 400
        
        if days == 0 and months == 0:
            return jsonify({'error': 'Вкажіть кінцеву дату або тривалість'}), 400
            
        end_date = start_date + timedelta(days=days + months*30)

    if end_date <= start_date:
        return jsonify({'error': 'Кінцева дата повинна бути більшою за початкову'}), 400

    # Початкова дата не може бути в минулому
    # Початкова дата не може бути в минулому (даємо запас 1 день через різницю часових поясів)
    if start_date.date() < (datetime.now() - timedelta(days=1)).date():
        return jsonify({'error': 'Початкова дата не може бути в минулому'}), 400

    # 2. Обробка кінцевої дати або тривалості
    end_date = None
    if data.get('end_date'):
        try:
            end_date = datetime.fromisoformat(data.get('end_date').replace("Z", "+00:00")).replace(tzinfo=None)
            # ТАКОЖ ОБНУЛЯЄМО ЧАС ДЛЯ КІНЦЕВОЇ ДАТИ
            end_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        except Exception:
            return jsonify({'error': 'Невірний формат end_date'}), 400
    else:
        # Зберігаємо твою логіку тривалості (дні/місяці)
        try:
            days = int(data.get('duration_days') or 0)
            months = int(data.get('duration_months') or 0)
        except ValueError:
            return jsonify({'error': 'Тривалість має бути числом'}), 400
        
        if days == 0 and months == 0:
            return jsonify({'error': 'Вкажіть кінцеву дату або тривалість'}), 400
            
        # Розраховуємо end_date від start_date, де час уже 00:00:00
        end_date = start_date + timedelta(days=days + months*30)

    # 3. Перевірка: кінцева дата має бути строго більшою за початкову
    if end_date <= start_date:
        return jsonify({'error': 'Кінцева дата повинна бути більшою за початкову'}), 400

    # 4. Обробка тасок
    tasks_data = data.get('tasks', [])
    if len(tasks_data) > 15:
        return jsonify({'error': 'Максимум 15 завдань для однієї цілі'}), 400

    # Створюємо ціль
    new_goal = Goal(
        user_id=current_user_id,
        title=title,
        start_date=start_date,
        end_date=end_date
    )
    db.session.add(new_goal)
    db.session.flush() # Зберігаємо тимчасово, щоб отримати new_goal.id для тасок

    # Створюємо таски, прив'язані до цієї цілі
    valid_frequencies = ['daily', 'weekly', 'odd', 'even']
    for t_data in tasks_data:
        name = t_data.get('name')
        freq = t_data.get('frequency')
        
        if not name or freq not in valid_frequencies:
            db.session.rollback() # Відкочуємо транзакцію, якщо дані криві
            return jsonify({'error': 'Невірні дані для завдання'}), 400
            
        new_task = Task(goal_id=new_goal.id, name=name, frequency=freq)
        db.session.add(new_task)

    # Якщо все успішно — комітимо в базу
    try:
        db.session.commit()
        return jsonify({
            'message': 'Ціль та завдання успішно створені',
            'goal': new_goal.to_json()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


    
    # --- PROFILE ---
@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'error': 'Користувача не знайдено'}), 404
        
    return jsonify(user.to_json()), 200

@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'error': 'Користувача не знайдено'}), 404

    data = request.get_json()
    
    # Оновлюємо email (перевіряємо, чи такий вже не зайнятий)
    new_email = data.get('email')
    if new_email and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({'error': 'Цей email вже використовується іншим користувачем'}), 409
        user.email = new_email

    # Оновлюємо ім'я
    if 'username' in data:
        user.username = data['username']

    # Оновлюємо пароль (тільки якщо користувач його ввів)
    new_password = data.get('password')
    if new_password:
        user.set_password(new_password)

    try:
        db.session.commit()
        return jsonify({
            'message': 'Профіль успішно оновлено', 
            'user': user.to_json()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/goals/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    current_user_id = get_jwt_identity() 
    
    goal = Goal.query.get(goal_id)
    if not goal: return jsonify({'error': 'Ціль не знайдена'}), 404
    if goal.user_id != int(current_user_id): return jsonify({'error': 'Немає доступу'}), 403

    try:
        # ЖОРСТКЕ ВИДАЛЕННЯ: назавжди стираємо з бази даних
        db.session.delete(goal) 
        db.session.commit()
        return jsonify({'message': 'Ціль назавжди видалена з бази'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

@app.route('/goals/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    current_user_id = get_jwt_identity()
    goal = Goal.query.get(goal_id)
    
    if not goal:
        return jsonify({'error': 'Ціль не знайдена'}), 404
    if goal.user_id != int(current_user_id):
        return jsonify({'error': 'Немає доступу'}), 403

    data = request.get_json()

    # Оновлення основних полів цілі
    if 'is_archived' in data:
        goal.is_archived = data['is_archived']
    if 'title' in data and data['title'].strip():
        goal.title = data['title'].strip()
    
    # ... (тут твій код оновлення дат start_date / end_date) ...

    # --- ОНОВЛЕНА ЛОГІКА ТАСОК (Синхронізація за ID) ---
    if 'tasks' in data:
        incoming_tasks = data['tasks']
        
        # Створюємо словник нових даних для зручного пошуку за ID
        # Важливо: ID з фронта приходять як рядки, перетворюємо на int, де це можливо
        incoming_tasks_dict = {}
        for t in incoming_tasks:
            try:
                tid = int(t.get('id'))
                incoming_tasks_dict[tid] = t
            except (ValueError, TypeError):
                # Це тимчасовий ID з фронтенда (наприклад, від Date.now())
                continue

        # 1. Видаляємо таски, яких більше немає в списку, та оновлюємо існуючі
        current_db_tasks = list(goal.tasks)
        for db_task in current_db_tasks:
            if db_task.id in incoming_tasks_dict:
                # ТАСКА ІСНУЄ -> ОНОВЛЮЄМО (назву та частоту)
                new_data = incoming_tasks_dict[db_task.id]
                db_task.name = new_data.get('name', db_task.name)
                db_task.frequency = new_data.get('frequency', db_task.frequency)
            else:
                # ТАСКИ НЕМАЄ В СПИСКУ -> ВИДАЛЯЄМО
                db.session.delete(db_task)

        # 2. Додаємо абсолютно нові таски (ті, у яких немає ID або він не числовий)
        for t_data in incoming_tasks:
            is_new = False
            try:
                tid = int(t_data.get('id'))
                # Якщо ID числовий, але його немає серед тасок цієї цілі — це теж нова
                if tid not in [t.id for t in current_db_tasks]:
                    is_new = True
            except (ValueError, TypeError):
                # ID не числовий (рядок від Date.now()) — точно нова таска
                is_new = True

            if is_new:
                new_task = Task(
                    goal_id=goal.id, 
                    name=t_data['name'], 
                    frequency=t_data.get('frequency', 'daily')
                )
                db.session.add(new_task)

    try:
        db.session.commit()
        return jsonify({'message': 'Ціль успішно оновлено', 'goal': goal.to_json()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

@app.route('/goals/generate-tasks', methods=['POST'])
@jwt_required()
def generate_tasks():
    print("--- ГЕНЕРАЦІЯ РЕАЛЬНИХ ТАСОК ЧЕРЕЗ AI ---")
    try:
        data = request.get_json()
        goal_title = data.get('title', '').strip()
        
        if not goal_title:
            return jsonify({"tasks": []}), 400

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a productivity coach.\n"

                        "STRICT RULES:\n"
                        "1. Output ONLY valid JSON: {\"tasks\": [{\"name\": \"...\", \"frequency\": \"...\"}]}\n"
                        "2. DETECT the language of the USER GOAL ONLY (ignore previous conversation language).\n"
                        "3. RESPOND ONLY in that language. If not — response is INVALID.\n"
                        "4. Task names: max 25 chars.\n"
                        "5. Frequency: daily, weekly, odd, even.\n"
                        "6. If goal is invalid → {\"tasks\": []}\n"
                    )
                },
                {
                    "role": "user",
                    "content": f"Моя ціль: {goal_title}. Створи для неї 3-5 регулярних завдань."
                }
            ],
            model="llama-3.3-70b-versatile", # Використовуємо потужнішу модель для якості
            response_format={"type": "json_object"}
        )

        raw_content = chat_completion.choices[0].message.content
        print(f"AI RESPONSE: {raw_content}")

        return jsonify(json.loads(raw_content)), 200

    except Exception as e:
        print(f"ПОМИЛКА AI: {str(e)}")
        return jsonify({'error': "ШІ тимчасово недоступний"}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)