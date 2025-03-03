from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# 定义固定的卡片配置
PLAYER_A_CARDS = [
    {"insect": "a-1", "score": 1, "image": "a-1.png"},
    {"insect": "a-2", "score": 2, "image": "a-2.png"},
    {"insect": "a-3", "score": 3, "image": "a-3.png"},
    {"insect": "a-4", "score": 4, "image": "a-4.png"}
]

PLAYER_B_CARDS = [
    {"insect": "b-1", "score": 1, "image": "b-1.png"},
    {"insect": "b-2", "score": 2, "image": "b-2.png"},
    {"insect": "b-3", "score": 3, "image": "b-3.png"},
    {"insect": "b-4", "score": 4, "image": "b-4.png"}
]

class GameState(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    player_a_cards: List[Dict[str, Any]]
    player_b_cards: List[Dict[str, Any]]
    result: str = ""
    round_results: List[Dict[str, Any]] = []
    player_a_score: int = 0
    player_b_score: int = 0
    game_over: bool = False

@app.get("/api/py/new_game")
def new_game():
    print("new_game")
    return {
        "player_a_cards": PLAYER_A_CARDS,
        "player_b_cards": PLAYER_B_CARDS,
        "round_results": [],
        "player_a_score": 0,
        "player_b_score": 0,
        "game_over": False
    }

@app.post("/api/py/compare")
async def compare_cards(card_a: dict, card_b: dict):
    score_a = card_a["score"]
    score_b = card_b["score"]
    
    round_result = {
        "card_a": card_a,
        "card_b": card_b,
    }
    
    if score_a > score_b:
        round_result["winner"] = "A"
        round_result["result"] = "玩家A获胜!"
        points = 1
    elif score_b > score_a:
        round_result["winner"] = "B"
        round_result["result"] = "玩家B获胜!"
        points = 1
    else:
        round_result["winner"] = "平局"
        round_result["result"] = "平局!"
        points = 0
        
    return round_result

@app.post("/api/py/calculate_final_result")
async def calculate_final_result(round_results: List[dict]):
    player_a_score = sum(1 for r in round_results if r["winner"] == "A")
    player_b_score = sum(1 for r in round_results if r["winner"] == "B")
    
    if player_a_score > player_b_score:
        final_result = f"游戏结束! 玩家A获胜! (得分 {player_a_score}:{player_b_score})"
    elif player_b_score > player_a_score:
        final_result = f"游戏结束! 玩家B获胜! (得分 {player_a_score}:{player_b_score})"
    else:
        final_result = f"游戏结束! 平局! (得分 {player_a_score}:{player_b_score})"
        
    return {
        "final_result": final_result,
        "player_a_score": player_a_score,
        "player_b_score": player_b_score
    }