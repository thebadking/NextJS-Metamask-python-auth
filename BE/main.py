from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from os import urandom
import time
from starlette.middleware.sessions import SessionMiddleware
from siwe import SiweMessage

app = FastAPI()

# Session and Security config
app.add_middleware(
    SessionMiddleware,
    secret_key="siwe-secret",
    session_cookie="siwe"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get session
def get_current_session(request: Request):
    return request.session

# Route to generate and return a nonce
@app.get('/nonce', tags=["SIWE Authentication"])
async def get_nonce(session=Depends(get_current_session)):
    try:
        nonce = urandom(16).hex()
        session["nonce"] = nonce
        session["nonce_timestamp"] = time.time()  # Store timestamp
        return {"nonce": nonce}
    except Exception as e:
        print("Exception: ", e)
        return JSONResponse(content={"message": str(e)}, status_code=500)

class VerificationModel(BaseModel):
    message: str
    signature: str

# Route to verify the message and signature
@app.post('/verify', tags=["SIWE Authentication"])
async def verify(payload: VerificationModel, session=Depends(get_current_session)):
    try:
        message = payload.message
        signature = payload.signature
        if not message:
            raise HTTPException(status_code=422, detail="Expected prepareMessage object as body.")

        SIWEObject = SiweMessage(message)
        SIWEObject.verify(signature)

        # Verify nonce
        stored_nonce = session.get("nonce", "")
        stored_nonce_timestamp = session.get("nonce_timestamp", 0)
        
        # Check if nonce is expired (1-minute expiration time)
        if time.time() - stored_nonce_timestamp > 60:
            raise HTTPException(status_code=401, detail="Nonce expired.")
        
        if SIWEObject.nonce != stored_nonce:
            raise HTTPException(status_code=401, detail="Nonce mismatch.")
        
        # Invalidate nonce by removing it from session
        del session["nonce"]
        del session["nonce_timestamp"]
        
        # Store SIWE message as a dictionary in the session
        session["siwe"] = SIWEObject.__dict__
        
        return JSONResponse(content=True)
    except Exception as e:
        print(f"Exception type: {type(e)}")
        print(f"Exception args: {e.args}")
        print("Exception:", e)
        session["siwe"] = None
        session["nonce"] = None
        return JSONResponse(content={"message": str(e)}, status_code=500)

# Route to access personal information
@app.get('/personal_information', tags=["User Information"])
async def personal_information(session=Depends(get_current_session)):
    siwe = session.get("siwe")
    if not siwe:
        raise HTTPException(status_code=401, detail="You have to first sign in.")
    
    return f"You are authenticated and your address is: {siwe.get('address', 'Unknown address')}"
