import os
import requests
import json
import time
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize extensions
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_KEY')  # use "openssl rand -base64 32" command in terminal to get a jwt secret key
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI') # e.g. "postgresql://name:passwrd@localhost:5432/db_name"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

jwt = JWTManager(app)
db = SQLAlchemy(app)

# Database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    occupation = db.Column(db.String(100), nullable=True)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

class InterviewHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    call_id = db.Column(db.String(100), nullable=False)
    summary = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    structured_data = db.Column(db.Text, nullable=True) 

class ConversationData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    transcript = db.Column(db.Text, nullable=False)

# Create database tables
with app.app_context():
    db.create_all()

def fetch_call_details(call_id):
    url = f"https://api.vapi.ai/call/{call_id}"
    headers = {
        "Authorization": f"Bearer {os.getenv('VAPI_API_KEY')}"
    }
    response = requests.get(url, headers=headers)
    return response.json()

@app.route("/api/call-details", methods=["GET"])
def get_call_details():
    call_id = request.args.get("call_id")
    if not call_id:
        return jsonify({"error": "Call ID is required"}), 400
    try:
        response = fetch_call_details(call_id)
        print(response)
        summary = response.get("summary")
        analysis = response.get("analysis")
        return jsonify({"analysis": analysis, "summary": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    admin = Admin.query.filter_by(username=username).first()
    if admin and check_password_hash(admin.password, password):
        access_token = create_access_token(identity=str(admin.id))
        return jsonify({'access_token': access_token, 'is_admin': True}), 200

    # Check User table
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token, 'is_admin': False}), 200

# Endpoint to fetch interview history for the logged-in user
@app.route('/api/interview-history', methods=['GET'])
@jwt_required()
def get_interview_history():
    user_id = int(get_jwt_identity())
    interviews = InterviewHistory.query.filter_by(user_id=user_id).all()
    history = [
        {
            'id': interview.id,
            'call_id': interview.call_id,
            'date': interview.date.strftime('%Y-%m-%d %H:%M'),
            'status': interview.status
        } for interview in interviews
    ]
    return jsonify({'history': history}), 200

# Admin endpoint to view all candidates' applications
@app.route('/api/admin/candidates', methods=['GET'])
@jwt_required()
def get_candidates():
    try:
        # Get all users
        users = User.query.all()
        candidates_data = []

        for user in users:
            # Get the latest interview for this user
            latest_interview = InterviewHistory.query.filter_by(user_id=user.id).order_by(InterviewHistory.date.desc()).first()
            
            candidate = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'occupation': user.occupation,
                'latest_interview_date': latest_interview.date.strftime('%Y-%m-%d %H:%M:%S') if latest_interview else None,
                'latest_interview_status': latest_interview.status if latest_interview else None,
                'latest_interview_id': latest_interview.id if latest_interview else None
            }
            candidates_data.append(candidate)
            
        return jsonify({'candidates': candidates_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/datasets', methods=['GET'])
@jwt_required()
def get_datasets():
    admin_id = int(get_jwt_identity())
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'Access forbidden'}), 403
    
    # Get all interviews with their associated data
    interviews = InterviewHistory.query.all()
    dataset = []
    for interview in interviews:
        user = User.query.get(interview.user_id)
        conversation = ConversationData.query.filter_by(user_id=interview.user_id).first()
        
        dataset.append({
            'user_id': interview.user_id,
            'username': user.username if user else None,
            'email': user.email if user else None,
            'call_id': interview.call_id,
            'date': interview.date.strftime('%Y-%m-%d %H:%M'),
            'summary': interview.summary,
            'status': interview.status,
            'transcript': conversation.transcript if conversation else None,
            'structured_data': json.loads(interview.structured_data) if interview.structured_data else None
        })
    
    return jsonify({'dataset': dataset}), 200

# Admin endpoint to fetch interview history for a specific user
@app.route('/api/admin/interview-history', methods=['GET'])
@jwt_required()
def admin_interview_history():
    admin_id = int(get_jwt_identity())
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'Access forbidden'}), 403
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    interviews = InterviewHistory.query.filter_by(user_id=user_id).all()
    history = [
        {
            'id': interview.id,
            'call_id': interview.call_id,
            'date': interview.date.strftime('%Y-%m-%d %H:%M'),
            'status': interview.status,
            'summary': interview.summary
        } for interview in interviews
    ]
    return jsonify({'history': history}), 200

@app.route('/api/save-interview', methods=['POST'])
@jwt_required()
def save_interview():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    call_id = data.get('call_id')
    summary = data.get('summary')
    status = data.get('status', 'pending')
    structured_data = data.get('structured_data')
    date = datetime.utcnow()
    if not call_id:
        return jsonify({'error': 'call_id is required'}), 400
    interview = InterviewHistory(
        user_id=user_id,
        call_id=call_id,
        summary=summary,
        status=status,
        date=date,
        structured_data=json.dumps(structured_data) if structured_data else None
    )
    db.session.add(interview)
    db.session.commit()
    return jsonify({'message': 'Interview saved successfully'}), 201

@app.route('/api/admin/update-status', methods=['POST'])
@jwt_required()
def admin_update_status():
    admin_id = int(get_jwt_identity())
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'Access forbidden'}), 403
    data = request.get_json()
    interview_id = data.get('interview_id')
    new_status = data.get('status')
    if not interview_id or not new_status:
        return jsonify({'error': 'interview_id and status are required'}), 400
    interview = InterviewHistory.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    interview.status = new_status
    db.session.commit()
    return jsonify({'message': 'Status updated successfully'}), 200

# Protect routes with @jwt_required
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'logged_in_as': current_user}), 200


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    phone_number = data.get('phone_number')
    occupation = data.get('occupation')

    # Check if username or email already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Create new user
    hashed_password = generate_password_hash(password)
    new_user = User(
        username=username,
        password=hashed_password,
        email=email,
        phone_number=phone_number,
        occupation=occupation
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An error occurred during registration'}), 500

if __name__ == "__main__":
    app.run(debug=True)