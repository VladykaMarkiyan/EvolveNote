from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)
    created_at = db.Column(db.String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    last_login_at = db.Column(db.String, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at,
            'last_login_at': self.last_login_at
        }

@app.route('/')
def home():
    return jsonify({"message": "API EvolveNote працює!"}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email та пароль обов\'язкові'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Користувач з таким email вже існує'}), 409

    new_user = User(
        email=data['email'],
        username=data.get('username')
    )
    new_user.set_password(data['password'])
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Успішна реєстрація!', 'user': new_user.to_json()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Введіть email та пароль'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        user.last_login_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db.session.commit()
        return jsonify({'message': 'Вхід успішний', 'user': user.to_json()}), 200
    
    return jsonify({'error': 'Невірний email або пароль'}), 401

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(host='0.0.0.0', port=5000, debug=True)