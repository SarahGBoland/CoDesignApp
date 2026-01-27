from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'codesign-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="Co-Design Connect API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== MODELS ====================

# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = Field(default="co-designer", pattern="^(co-designer|facilitator)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Project Models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    owner_id: str
    created_at: str
    updated_at: str

# Session Models
class SessionCreate(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = ""

class SessionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_id: str
    name: str
    description: str
    current_step: int = 0
    created_at: str
    updated_at: str

# Problem Tree Models
class ProblemTreeItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    type: str = Field(pattern="^(cause|effect|problem)$")
    parent_id: Optional[str] = None

class ProblemTreeCreate(BaseModel):
    session_id: str
    core_problem: str
    items: List[ProblemTreeItem] = []

class ProblemTreeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    session_id: str
    core_problem: str
    items: List[dict]
    created_at: str
    updated_at: str

# Empathy Map Models
class EmpathyMapCreate(BaseModel):
    session_id: str
    persona_name: Optional[str] = "User"
    says: List[str] = []
    thinks: List[str] = []
    does: List[str] = []
    feels: List[str] = []

class EmpathyMapResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    session_id: str
    persona_name: str
    says: List[str]
    thinks: List[str]
    does: List[str]
    feels: List[str]
    created_at: str
    updated_at: str

# Story Map Models
class StoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    type: str = Field(pattern="^(activity|task|story)$")
    column: int = 0
    row: int = 0

class StoryMapCreate(BaseModel):
    session_id: str
    title: Optional[str] = "User Journey"
    items: List[StoryItem] = []

class StoryMapResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    session_id: str
    title: str
    items: List[dict]
    created_at: str
    updated_at: str

# Ideas Board Models
class IdeaCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    category: Optional[str] = "general"
    votes: int = 0
    color: Optional[str] = "#FFFFFF"

class IdeasBoardCreate(BaseModel):
    session_id: str
    ideas: List[IdeaCard] = []

class IdeasBoardResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    session_id: str
    ideas: List[dict]
    created_at: str
    updated_at: str

# I Like I Wish What If Models
class FeedbackItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    type: str = Field(pattern="^(like|wish|whatif)$")

class FeedbackCreate(BaseModel):
    session_id: str
    items: List[FeedbackItem] = []

class FeedbackResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    session_id: str
    items: List[dict]
    created_at: str
    updated_at: str

# Manage Expectations Models
class ExpectationItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    type: str = Field(pattern="^(goal|constraint|success)$")
    priority: Optional[int] = 1

class ExpectationsCreate(BaseModel):
    session_id: str
    items: List[ExpectationItem] = []

class ExpectationsResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    session_id: str
    items: List[dict]
    created_at: str
    updated_at: str

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        created_at=now
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

# ==================== PROJECT ROUTES ====================

@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    project_doc = {
        "id": project_id,
        "name": project.name,
        "description": project.description or "",
        "owner_id": current_user["id"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.projects.insert_one(project_doc)
    return ProjectResponse(**project_doc)

@api_router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(current_user: dict = Depends(get_current_user)):
    projects = await db.projects.find({"owner_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return [ProjectResponse(**p) for p in projects]

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "owner_id": current_user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**project)

@api_router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, update: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "owner_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return ProjectResponse(**updated)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": project_id, "owner_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    # Also delete related sessions and their data
    await db.sessions.delete_many({"project_id": project_id})
    return {"message": "Project deleted"}

# ==================== SESSION ROUTES ====================

@api_router.post("/sessions", response_model=SessionResponse)
async def create_session(session: SessionCreate, current_user: dict = Depends(get_current_user)):
    # Verify project ownership
    project = await db.projects.find_one({"id": session.project_id, "owner_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    session_doc = {
        "id": session_id,
        "project_id": session.project_id,
        "name": session.name,
        "description": session.description or "",
        "current_step": 0,
        "created_at": now,
        "updated_at": now
    }
    
    await db.sessions.insert_one(session_doc)
    return SessionResponse(**session_doc)

@api_router.get("/sessions", response_model=List[SessionResponse])
async def get_sessions(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if project_id:
        query["project_id"] = project_id
    sessions = await db.sessions.find(query, {"_id": 0}).to_list(100)
    return [SessionResponse(**s) for s in sessions]

@api_router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(**session)

@api_router.put("/sessions/{session_id}/step")
async def update_session_step(session_id: str, step: int, current_user: dict = Depends(get_current_user)):
    result = await db.sessions.update_one(
        {"id": session_id},
        {"$set": {"current_step": step, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Step updated"}

# ==================== PROBLEM TREE ROUTES ====================

@api_router.post("/problem-trees", response_model=ProblemTreeResponse)
async def create_problem_tree(data: ProblemTreeCreate, current_user: dict = Depends(get_current_user)):
    tree_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    tree_doc = {
        "id": tree_id,
        "session_id": data.session_id,
        "core_problem": data.core_problem,
        "items": [item.model_dump() for item in data.items],
        "created_at": now,
        "updated_at": now
    }
    
    await db.problem_trees.insert_one(tree_doc)
    return ProblemTreeResponse(**tree_doc)

@api_router.get("/problem-trees/{session_id}", response_model=ProblemTreeResponse)
async def get_problem_tree(session_id: str, current_user: dict = Depends(get_current_user)):
    tree = await db.problem_trees.find_one({"session_id": session_id}, {"_id": 0})
    if not tree:
        raise HTTPException(status_code=404, detail="Problem tree not found")
    return ProblemTreeResponse(**tree)

@api_router.put("/problem-trees/{session_id}", response_model=ProblemTreeResponse)
async def update_problem_tree(session_id: str, data: ProblemTreeCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    tree_id = str(uuid.uuid4())
    
    # Check if exists
    existing = await db.problem_trees.find_one({"session_id": session_id}, {"_id": 0})
    
    if existing:
        await db.problem_trees.update_one(
            {"session_id": session_id},
            {"$set": {
                "core_problem": data.core_problem,
                "items": [item.model_dump() for item in data.items],
                "updated_at": now
            }}
        )
    else:
        tree_doc = {
            "id": tree_id,
            "session_id": session_id,
            "core_problem": data.core_problem,
            "items": [item.model_dump() for item in data.items],
            "created_at": now,
            "updated_at": now
        }
        await db.problem_trees.insert_one(tree_doc)
    
    tree = await db.problem_trees.find_one({"session_id": session_id}, {"_id": 0})
    return ProblemTreeResponse(**tree)

# ==================== EMPATHY MAP ROUTES ====================

@api_router.post("/empathy-maps", response_model=EmpathyMapResponse)
async def create_empathy_map(data: EmpathyMapCreate, current_user: dict = Depends(get_current_user)):
    map_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    map_doc = {
        "id": map_id,
        "session_id": data.session_id,
        "persona_name": data.persona_name or "User",
        "says": data.says,
        "thinks": data.thinks,
        "does": data.does,
        "feels": data.feels,
        "created_at": now,
        "updated_at": now
    }
    
    await db.empathy_maps.insert_one(map_doc)
    return EmpathyMapResponse(**map_doc)

@api_router.get("/empathy-maps/{session_id}", response_model=EmpathyMapResponse)
async def get_empathy_map(session_id: str, current_user: dict = Depends(get_current_user)):
    emp_map = await db.empathy_maps.find_one({"session_id": session_id}, {"_id": 0})
    if not emp_map:
        raise HTTPException(status_code=404, detail="Empathy map not found")
    return EmpathyMapResponse(**emp_map)

@api_router.put("/empathy-maps/{session_id}", response_model=EmpathyMapResponse)
async def update_empathy_map(session_id: str, data: EmpathyMapCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    map_id = str(uuid.uuid4())
    
    existing = await db.empathy_maps.find_one({"session_id": session_id}, {"_id": 0})
    
    if existing:
        await db.empathy_maps.update_one(
            {"session_id": session_id},
            {"$set": {
                "persona_name": data.persona_name or "User",
                "says": data.says,
                "thinks": data.thinks,
                "does": data.does,
                "feels": data.feels,
                "updated_at": now
            }}
        )
    else:
        map_doc = {
            "id": map_id,
            "session_id": session_id,
            "persona_name": data.persona_name or "User",
            "says": data.says,
            "thinks": data.thinks,
            "does": data.does,
            "feels": data.feels,
            "created_at": now,
            "updated_at": now
        }
        await db.empathy_maps.insert_one(map_doc)
    
    emp_map = await db.empathy_maps.find_one({"session_id": session_id}, {"_id": 0})
    return EmpathyMapResponse(**emp_map)

# ==================== STORY MAP ROUTES ====================

@api_router.post("/story-maps", response_model=StoryMapResponse)
async def create_story_map(data: StoryMapCreate, current_user: dict = Depends(get_current_user)):
    map_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    map_doc = {
        "id": map_id,
        "session_id": data.session_id,
        "title": data.title or "User Journey",
        "items": [item.model_dump() for item in data.items],
        "created_at": now,
        "updated_at": now
    }
    
    await db.story_maps.insert_one(map_doc)
    return StoryMapResponse(**map_doc)

@api_router.get("/story-maps/{session_id}", response_model=StoryMapResponse)
async def get_story_map(session_id: str, current_user: dict = Depends(get_current_user)):
    story_map = await db.story_maps.find_one({"session_id": session_id}, {"_id": 0})
    if not story_map:
        raise HTTPException(status_code=404, detail="Story map not found")
    return StoryMapResponse(**story_map)

@api_router.put("/story-maps/{session_id}", response_model=StoryMapResponse)
async def update_story_map(session_id: str, data: StoryMapCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    
    await db.story_maps.update_one(
        {"session_id": session_id},
        {"$set": {
            "title": data.title or "User Journey",
            "items": [item.model_dump() for item in data.items],
            "updated_at": now
        }},
        upsert=True
    )
    
    story_map = await db.story_maps.find_one({"session_id": session_id}, {"_id": 0})
    return StoryMapResponse(**story_map)

# ==================== IDEAS BOARD ROUTES ====================

@api_router.post("/ideas-boards", response_model=IdeasBoardResponse)
async def create_ideas_board(data: IdeasBoardCreate, current_user: dict = Depends(get_current_user)):
    board_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    board_doc = {
        "id": board_id,
        "session_id": data.session_id,
        "ideas": [idea.model_dump() for idea in data.ideas],
        "created_at": now,
        "updated_at": now
    }
    
    await db.ideas_boards.insert_one(board_doc)
    return IdeasBoardResponse(**board_doc)

@api_router.get("/ideas-boards/{session_id}", response_model=IdeasBoardResponse)
async def get_ideas_board(session_id: str, current_user: dict = Depends(get_current_user)):
    board = await db.ideas_boards.find_one({"session_id": session_id}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Ideas board not found")
    return IdeasBoardResponse(**board)

@api_router.put("/ideas-boards/{session_id}", response_model=IdeasBoardResponse)
async def update_ideas_board(session_id: str, data: IdeasBoardCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    
    await db.ideas_boards.update_one(
        {"session_id": session_id},
        {"$set": {
            "ideas": [idea.model_dump() for idea in data.ideas],
            "updated_at": now
        }},
        upsert=True
    )
    
    board = await db.ideas_boards.find_one({"session_id": session_id}, {"_id": 0})
    return IdeasBoardResponse(**board)

# ==================== FEEDBACK (I LIKE I WISH WHAT IF) ROUTES ====================

@api_router.post("/feedback", response_model=FeedbackResponse)
async def create_feedback(data: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    feedback_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    feedback_doc = {
        "id": feedback_id,
        "session_id": data.session_id,
        "items": [item.model_dump() for item in data.items],
        "created_at": now,
        "updated_at": now
    }
    
    await db.feedback.insert_one(feedback_doc)
    return FeedbackResponse(**feedback_doc)

@api_router.get("/feedback/{session_id}", response_model=FeedbackResponse)
async def get_feedback(session_id: str, current_user: dict = Depends(get_current_user)):
    feedback = await db.feedback.find_one({"session_id": session_id}, {"_id": 0})
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return FeedbackResponse(**feedback)

@api_router.put("/feedback/{session_id}", response_model=FeedbackResponse)
async def update_feedback(session_id: str, data: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    
    await db.feedback.update_one(
        {"session_id": session_id},
        {"$set": {
            "items": [item.model_dump() for item in data.items],
            "updated_at": now
        }},
        upsert=True
    )
    
    feedback = await db.feedback.find_one({"session_id": session_id}, {"_id": 0})
    return FeedbackResponse(**feedback)

# ==================== EXPECTATIONS ROUTES ====================

@api_router.post("/expectations", response_model=ExpectationsResponse)
async def create_expectations(data: ExpectationsCreate, current_user: dict = Depends(get_current_user)):
    exp_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    exp_doc = {
        "id": exp_id,
        "session_id": data.session_id,
        "items": [item.model_dump() for item in data.items],
        "created_at": now,
        "updated_at": now
    }
    
    await db.expectations.insert_one(exp_doc)
    return ExpectationsResponse(**exp_doc)

@api_router.get("/expectations/{session_id}", response_model=ExpectationsResponse)
async def get_expectations(session_id: str, current_user: dict = Depends(get_current_user)):
    expectations = await db.expectations.find_one({"session_id": session_id}, {"_id": 0})
    if not expectations:
        raise HTTPException(status_code=404, detail="Expectations not found")
    return ExpectationsResponse(**expectations)

@api_router.put("/expectations/{session_id}", response_model=ExpectationsResponse)
async def update_expectations(session_id: str, data: ExpectationsCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    
    await db.expectations.update_one(
        {"session_id": session_id},
        {"$set": {
            "items": [item.model_dump() for item in data.items],
            "updated_at": now
        }},
        upsert=True
    )
    
    expectations = await db.expectations.find_one({"session_id": session_id}, {"_id": 0})
    return ExpectationsResponse(**expectations)

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router and setup middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
