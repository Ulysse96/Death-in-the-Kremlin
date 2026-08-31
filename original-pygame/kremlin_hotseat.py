"""
Death in the Kremlin — Hot-seat single device version
Requires: pip install pygame
"""

import pygame, sys, random, math
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum, auto

# ── Palette ────────────────────────────────────────────────────────────────────
W, H = 900, 680
C_CRIMSON=(180,20,20); C_DARK_RED=(100,8,8); C_GOLD=(210,170,50)
C_CREAM=(245,235,210); C_PARCHMENT=(220,205,175); C_DARK=(18,12,10)
C_MID=(55,38,30); C_PANEL=(38,25,20); C_BORDER=(100,65,40)
C_GREEN=(40,100,50); C_DARK_GRN=(20,60,30); C_BLUE=(40,70,130)
C_DARK_BLU=(20,40,90); C_PURPLE=(80,30,100); C_GREY=(130,120,110)
C_ARROW=(70,50,30)

CHARACTERS = ["Marshal","KGB Director","Youth President","Head Marxologist","Lysenkoism Prof.","Red Veteran"]
SPY_OPTIONS = ["Wire the phone","Search the trash cans","Bribe a subordinate","Intercept the mail","Follow at night","Break into the office"]
SECRET_NAMES  = {1:"Deviant", 2:"Factious", 3:"Traitor"}
SECRET_COLORS = {1:C_GOLD, 2:C_CRIMSON, 3:C_PURPLE}

# ── Portrait system (unchanged from original) ──────────────────────────────────
def _e(s,c,cx,cy,rx,ry,w=0): pygame.draw.ellipse(s,c,(int(cx-rx),int(cy-ry),int(rx*2),int(ry*2)),w)
def _c(s,c,cx,cy,r,w=0): pygame.draw.circle(s,c,(int(cx),int(cy)),max(1,int(r)),w)
def _r(s,c,x,y,w,h,rad=0): pygame.draw.rect(s,c,(int(x),int(y),int(w),int(h)),border_radius=rad)
def _p(s,c,pts): pygame.draw.polygon(s,c,[(int(x),int(y)) for x,y in pts])
def _l(s,c,x1,y1,x2,y2,w=2): pygame.draw.line(s,c,(int(x1),int(y1)),(int(x2),int(y2)),max(1,w))

_T=(210,170,120);_BR=(150,100,55);_FG=(220,185,80);_GR=(180,175,165);_WH=(235,230,220)
_DK=(100,75,45);_OR=(210,130,50);_SG=(80,80,90);_SN=(30,40,80);_SK=(120,115,70)
_SW=(240,238,228);_RA=(180,20,20);_GB=(200,165,40);_LW=(230,230,225);_HG=(40,80,40)
_EB=(20,15,10);_NP=(200,130,120);_PC={}

def _marshal(s,cx,cy,sz):
    S=sz/50
    _p(s,_SK,[(cx-16*S,cy+4*S),(cx+16*S,cy+4*S),(cx+18*S,cy+50*S),(cx-18*S,cy+50*S)])
    for i,col in enumerate([_GB,(200,50,50),_GB,(50,100,200)]): _c(s,col,cx-9*S+i*6*S,cy+14*S,3*S)
    _r(s,_GB,cx-18*S,cy+3*S,8*S,5*S,2); _r(s,_GB,cx+10*S,cy+3*S,8*S,5*S,2)
    _e(s,_T,cx,cy+4*S,10*S,6*S); _e(s,_T,cx,cy-14*S,18*S,16*S)
    _e(s,_FG,cx,cy-6*S,10*S,7*S); _e(s,(160,110,80),cx,cy-3*S,6*S,4*S)
    _e(s,_EB,cx,cy-7*S,4*S,3*S)
    _c(s,_SW,cx-8*S,cy-18*S,4*S);_c(s,_SW,cx+8*S,cy-18*S,4*S)
    _c(s,_EB,cx-8*S,cy-18*S,2*S);_c(s,_EB,cx+8*S,cy-18*S,2*S)
    _p(s,_BR,[(cx-14*S,cy-22*S),(cx-22*S,cy-10*S),(cx-18*S,cy-2*S),(cx-10*S,cy-16*S)])
    _p(s,_BR,[(cx+14*S,cy-22*S),(cx+22*S,cy-10*S),(cx+18*S,cy-2*S),(cx+10*S,cy-16*S)])
    _p(s,_SK,[(cx-20*S,cy-26*S),(cx+20*S,cy-26*S),(cx+16*S,cy-34*S),(cx-16*S,cy-34*S)])
    _r(s,_GB,cx-22*S,cy-28*S,44*S,4*S)
    _p(s,(90,85,55),[(cx-22*S,cy-28*S),(cx+22*S,cy-28*S),(cx+26*S,cy-24*S),(cx-26*S,cy-24*S)])
    _c(s,_GB,cx,cy-30*S,4*S)

def _kgb(s,cx,cy,sz):
    S=sz/50
    _e(s,_SG,cx,cy+20*S,22*S,28*S)
    _p(s,(55,55,65),[(cx,cy+4*S),(cx-8*S,cy+16*S),(cx-14*S,cy-2*S)])
    _p(s,(55,55,65),[(cx,cy+4*S),(cx+8*S,cy+16*S),(cx+14*S,cy-2*S)])
    _p(s,_SW,[(cx-4*S,cy+4*S),(cx+4*S,cy+4*S),(cx+3*S,cy+22*S),(cx-3*S,cy+22*S)])
    _p(s,_RA,[(cx-2*S,cy+8*S),(cx+2*S,cy+8*S),(cx+1*S,cy+20*S),(cx-1*S,cy+20*S)])
    _r(s,_RA,cx-24*S,cy+10*S,10*S,7*S,2)
    for i in range(3): _c(s,_GB,cx,cy+6*S+i*5*S,int(1.5*S)+1)
    _e(s,_T,cx,cy-14*S,22*S,20*S)
    _e(s,_FG,cx-16*S,cy-10*S,10*S,8*S);_e(s,_FG,cx+16*S,cy-10*S,10*S,8*S)
    _e(s,_NP,cx,cy-8*S,8*S,6*S);_c(s,_EB,cx,cy-8*S,3*S)
    _c(s,_SW,cx-10*S,cy-18*S,4*S);_c(s,_SW,cx+10*S,cy-18*S,4*S)
    _c(s,_EB,cx-10*S,cy-18*S,2*S);_c(s,_EB,cx+10*S,cy-18*S,2*S)
    _c(s,_T,cx-18*S,cy-28*S,6*S);_c(s,_T,cx+18*S,cy-28*S,6*S)
    _c(s,_NP,cx-18*S,cy-28*S,3*S);_c(s,_NP,cx+18*S,cy-28*S,3*S)

def _youth(s,cx,cy,sz):
    S=sz/50
    _p(s,(50,90,50),[(cx-14*S,cy+4*S),(cx+14*S,cy+4*S),(cx+16*S,cy+50*S),(cx-16*S,cy+50*S)])
    _p(s,_SW,[(cx-6*S,cy+4*S),(cx+6*S,cy+4*S),(cx+4*S,cy+18*S),(cx-4*S,cy+18*S)])
    _e(s,_OR,cx,cy-14*S,16*S,15*S)
    _p(s,_OR,[(cx-14*S,cy-24*S),(cx-8*S,cy-38*S),(cx-4*S,cy-24*S)])
    _p(s,_OR,[(cx+14*S,cy-24*S),(cx+8*S,cy-38*S),(cx+4*S,cy-24*S)])
    _p(s,_NP,[(cx-12*S,cy-25*S),(cx-8*S,cy-35*S),(cx-5*S,cy-25*S)])
    _p(s,_NP,[(cx+12*S,cy-25*S),(cx+8*S,cy-35*S),(cx+5*S,cy-25*S)])
    _e(s,_WH,cx,cy-8*S,8*S,6*S)
    _p(s,_NP,[(cx,cy-10*S),(cx-2*S,cy-8*S),(cx+2*S,cy-8*S)])
    _l(s,_DK,cx-8*S,cy-8*S,cx-22*S,cy-10*S,1);_l(s,_DK,cx+8*S,cy-8*S,cx+22*S,cy-10*S,1)
    _l(s,_DK,cx-8*S,cy-6*S,cx-22*S,cy-6*S,1);_l(s,_DK,cx+8*S,cy-6*S,cx+22*S,cy-6*S,1)
    _e(s,(80,160,80),cx-7*S,cy-17*S,5*S,4*S);_e(s,(80,160,80),cx+7*S,cy-17*S,5*S,4*S)
    _e(s,_EB,cx-7*S,cy-17*S,2*S,3*S);_e(s,_EB,cx+7*S,cy-17*S,2*S,3*S)
    _p(s,_HG,[(cx-20*S,cy-26*S),(cx+20*S,cy-26*S),(cx+16*S,cy-36*S),(cx-16*S,cy-36*S)])
    _r(s,(30,60,30),cx-22*S,cy-28*S,44*S,4*S)
    _p(s,(50,40,30),[(cx-24*S,cy-26*S),(cx+24*S,cy-26*S),(cx+26*S,cy-23*S),(cx-26*S,cy-23*S)])
    star=[]
    for k in range(5):
        a=math.radians(-90+72*k); b=math.radians(-90+72*k+36)
        star.append((cx+5*S*math.cos(a),cy-32*S+5*S*math.sin(a)))
        star.append((cx+2*S*math.cos(b),cy-32*S+2*S*math.sin(b)))
    _p(s,_RA,star)

def _marxologist(s,cx,cy,sz):
    S=sz/50
    _p(s,_SN,[(cx-16*S,cy+2*S),(cx+16*S,cy+2*S),(cx+18*S,cy+50*S),(cx-18*S,cy+50*S)])
    _p(s,_SW,[(cx-5*S,cy+2*S),(cx+5*S,cy+2*S),(cx+4*S,cy+22*S),(cx-4*S,cy+22*S)])
    _p(s,_RA,[(cx-2*S,cy+4*S),(cx+2*S,cy+4*S),(cx,cy+22*S)])
    _p(s,(25,35,70),[(cx,cy+2*S),(cx-8*S,cy+18*S),(cx-16*S,cy+2*S)])
    _p(s,(25,35,70),[(cx,cy+2*S),(cx+8*S,cy+18*S),(cx+16*S,cy+2*S)])
    _e(s,_DK,cx,cy-12*S,20*S,18*S);_e(s,(80,55,30),cx,cy-22*S,18*S,6*S)
    _e(s,_T,cx,cy-4*S,14*S,10*S);_e(s,(160,110,90),cx,cy-2*S,10*S,7*S)
    _l(s,(80,50,30),cx-6*S,cy-2*S,cx+6*S,cy-2*S,max(1,int(S)))
    _c(s,(60,40,25),cx-4*S,cy-6*S,2*S);_c(s,(60,40,25),cx+4*S,cy-6*S,2*S)
    _c(s,_SW,cx-8*S,cy-16*S,5*S);_c(s,_SW,cx+8*S,cy-16*S,5*S)
    _c(s,(60,80,40),cx-8*S,cy-16*S,3*S);_c(s,(60,80,40),cx+8*S,cy-16*S,3*S)
    _c(s,_EB,cx-8*S,cy-16*S,int(1.5*S)+1);_c(s,_EB,cx+8*S,cy-16*S,int(1.5*S)+1)
    _c(s,_GB,cx-8*S,cy-16*S,6*S,max(1,int(S)));_c(s,_GB,cx+8*S,cy-16*S,6*S,max(1,int(S)))
    _l(s,_GB,cx-2*S,cy-16*S,cx+2*S,cy-16*S,max(1,int(S)))
    _l(s,_GB,cx-14*S,cy-16*S,cx-18*S,cy-14*S,max(1,int(S)))
    _l(s,_GB,cx+14*S,cy-16*S,cx+18*S,cy-14*S,max(1,int(S)))
    _c(s,_DK,cx-20*S,cy-14*S,5*S);_c(s,_DK,cx+20*S,cy-14*S,5*S)
    _c(s,_NP,cx-20*S,cy-14*S,int(2.5*S)+1);_c(s,_NP,cx+20*S,cy-14*S,int(2.5*S)+1)

def _lysenko(s,cx,cy,sz):
    S=sz/50
    _p(s,_LW,[(cx-16*S,cy+2*S),(cx+16*S,cy+2*S),(cx+18*S,cy+50*S),(cx-18*S,cy+50*S)])
    _p(s,(200,200,195),[(cx,cy+2*S),(cx-7*S,cy+20*S),(cx-16*S,cy+2*S)])
    _p(s,(200,200,195),[(cx,cy+2*S),(cx+7*S,cy+20*S),(cx+16*S,cy+2*S)])
    _r(s,(200,200,195),cx+6*S,cy+22*S,8*S,10*S,1)
    _l(s,_EB,cx+10*S,cy+22*S,cx+10*S,cy+30*S,max(1,int(S)))
    _p(s,_SW,[(cx-4*S,cy+2*S),(cx+4*S,cy+2*S),(cx+3*S,cy+20*S),(cx-3*S,cy+20*S)])
    _p(s,(40,40,120),[(cx-2*S,cy+4*S),(cx+2*S,cy+4*S),(cx,cy+20*S)])
    _e(s,(40,35,40),cx,cy+1*S,10*S,7*S);_c(s,(40,35,40),cx,cy-16*S,16*S)
    _p(s,(200,170,40),[(cx+12*S,cy-14*S),(cx+24*S,cy-12*S),(cx+12*S,cy-10*S)])
    _l(s,(160,130,20),cx+12*S,cy-12*S,cx+24*S,cy-12*S,max(1,int(S)))
    _c(s,(220,200,50),cx-6*S,cy-18*S,6*S);_c(s,(220,200,50),cx+6*S,cy-18*S,6*S)
    _c(s,_EB,cx-6*S,cy-18*S,3*S);_c(s,_EB,cx+6*S,cy-18*S,3*S)
    _c(s,_SW,cx-5*S,cy-19*S,1);_c(s,_SW,cx+5*S,cy-19*S,1)
    for i in range(3):
        _p(s,(55,45,55),[(cx-4*S+i*4*S,cy-30*S),(cx-6*S+i*4*S,cy-42*S),(cx-2*S+i*4*S,cy-30*S)])
    _p(s,(35,30,35),[(cx-16*S,cy+2*S),(cx-26*S,cy+20*S),(cx-20*S,cy+28*S),(cx-12*S,cy+14*S)])
    _p(s,(35,30,35),[(cx+16*S,cy+2*S),(cx+26*S,cy+20*S),(cx+20*S,cy+28*S),(cx+12*S,cy+14*S)])

def _veteran(s,cx,cy,sz):
    S=sz/50
    _p(s,(70,50,35),[(cx-15*S,cy+4*S),(cx+15*S,cy+4*S),(cx+17*S,cy+50*S),(cx-17*S,cy+50*S)])
    _p(s,_SW,[(cx-4*S,cy+4*S),(cx+4*S,cy+4*S),(cx+3*S,cy+22*S),(cx-3*S,cy+22*S)])
    _r(s,_RA,cx-22*S,cy+10*S,10*S,6*S,2)
    _l(s,(220,50,50),cx-22*S,cy+13*S,cx-12*S,cy+13*S,max(1,int(S)))
    _l(s,(80,60,40),cx-6*S,cy+4*S,cx-10*S,cy+50*S,max(1,int(S*1.5)))
    _l(s,(80,60,40),cx+6*S,cy+4*S,cx+10*S,cy+50*S,max(1,int(S*1.5)))
    _e(s,_WH,cx,cy-14*S,16*S,15*S);_e(s,_WH,cx+4*S,cy-6*S,12*S,7*S)
    _e(s,_NP,cx+14*S,cy-6*S,4*S,3*S)
    _p(s,_GR,[(cx-4*S,cy-2*S),(cx+8*S,cy-2*S),(cx+6*S,cy+12*S),(cx+2*S,cy+14*S),(cx-2*S,cy+12*S)])
    _l(s,_WH,cx+2*S,cy+2*S,cx+1*S,cy+16*S,max(1,int(S*1.5)))
    _p(s,_WH,[(cx-14*S,cy-18*S),(cx-24*S,cy-10*S),(cx-22*S,cy-2*S),(cx-12*S,cy-10*S)])
    _p(s,_WH,[(cx+14*S,cy-18*S),(cx+24*S,cy-10*S),(cx+22*S,cy-2*S),(cx+12*S,cy-10*S)])
    _p(s,_NP,[(cx-15*S,cy-16*S),(cx-22*S,cy-10*S),(cx-20*S,cy-4*S),(cx-13*S,cy-12*S)])
    _l(s,_GR,cx-8*S,cy-26*S,cx-18*S,cy-38*S,max(2,int(S*1.5)))
    _l(s,_GR,cx-18*S,cy-38*S,cx-14*S,cy-44*S,max(2,int(S*1.5)))
    _l(s,_GR,cx+8*S,cy-26*S,cx+18*S,cy-38*S,max(2,int(S*1.5)))
    _l(s,_GR,cx+18*S,cy-38*S,cx+14*S,cy-44*S,max(2,int(S*1.5)))
    _e(s,_SW,cx-6*S,cy-18*S,4*S,3*S);_e(s,_SW,cx+6*S,cy-18*S,4*S,3*S)
    _c(s,(80,100,60),cx-6*S,cy-18*S,2*S);_c(s,(80,100,60),cx+6*S,cy-18*S,2*S)
    _l(s,_GR,cx-10*S,cy-22*S,cx-14*S,cy-20*S,1);_l(s,_GR,cx+10*S,cy-22*S,cx+14*S,cy-20*S,1)
    _e(s,(55,45,30),cx-2*S,cy-30*S,18*S,8*S)
    _r(s,(45,36,22),cx-16*S,cy-34*S,32*S,8*S,3)
    _p(s,(40,32,18),[(cx-16*S,cy-30*S),(cx+14*S,cy-30*S),(cx+18*S,cy-26*S),(cx-20*S,cy-26*S)])

_PORTRAITS={"Marshal":_marshal,"KGB Director":_kgb,"Youth President":_youth,
            "Head Marxologist":_marxologist,"Lysenkoism Prof.":_lysenko,"Red Veteran":_veteran}

def draw_portrait(surf, char, cx, cy, size):
    key=(char,size)
    if key not in _PC:
        s=size*2; img=pygame.Surface((s,s),pygame.SRCALPHA)
        fn=_PORTRAITS.get(char)
        if fn: fn(img,s//2,s//2,size)
        _PC[key]=img
    surf.blit(_PC[key],(cx-size,cy-size))

# ── Game data ──────────────────────────────────────────────────────────────────

class Phase(Enum):
    SETUP_PLAYERS=auto(); SETUP_CHARS=auto(); SECRET_DEAL=auto()
    ROUND_START=auto(); SPY_CHOOSE=auto(); SPY_METHOD=auto(); SPY_RESULT=auto()
    BRIBE_CHOOSE=auto(); VOTE=auto(); VOTE_RESULT=auto()
    ACCUSE_CHOOSE=auto(); ACCUSE_RESPOND=auto(); ACCUSE_OUTCOME=auto()
    GAME_OVER=auto()

@dataclass
class Player:
    name:str; character:str=""; secret_level:int=0; alive:bool=True
    clue_map:dict=field(default_factory=dict)
    clues_found:dict=field(default_factory=dict)
    known_secrets:dict=field(default_factory=dict)
    spy_log:set=field(default_factory=set)
    bribe_inbox:list=field(default_factory=list)

    def has_discovered(self,n): return n in self.known_secrets
    def can_spy_with(self,n,i): return (n,i) not in self.spy_log
    def record_spy(self,target,i):
        self.spy_log.add((target.name,i))
        cl=self.clue_map.get(i)
        if cl:
            self.clues_found.setdefault(target.name,set()).add(cl)
            needed = target.secret_level + 1  # Deviant=2, Factious=3, Traitor=4
            if len(self.clues_found[target.name])>=needed:
                self.known_secrets[target.name]=target.secret_level

class Game:
    def __init__(self):
        self.players:list[Player]=[]; self.phase=Phase.SETUP_PLAYERS
        self.round=1; self.current_player_idx=0
        self.votes:dict={}; self.current_accusation=None; self.accuse_outcome:dict={}
        self.pending_bribe_idx=0; self.pending_vote_idx=0; self.pending_accuse_idx=0
        self.spy_target:Optional[Player]=None; self.spy_result:Optional[dict]=None
        self.bribe_mode=""; self.bribe_recipient:Optional[Player]=None
        self.bribe_target:Optional[Player]=None; self._bribe_action=""
        self.winner:Optional[Player]=None; self.winner_candidate:Optional[Player]=None
        self.secret_seen=False; self.accuse_target:Optional[Player]=None
        # setup state
        self.num_players=4; self.setup_names=["Beria","Khrushchev","Molotov","Malenkov","",""]
        self.setup_chars:list[Optional[str]]=[None]*6; self.active_input=-1

    @property
    def alive_players(self): return [p for p in self.players if p.alive]
    def current_player(self):
        a=self.alive_players; return a[self.current_player_idx%len(a)] if a else None
    def player(self,name): return next((p for p in self.players if p.name==name),None)
    def vote_tally(self):
        t={}
        for _,v in self.votes.items(): t[v]=t.get(v,0)+1
        return t
    def check_winner(self):
        a=self.alive_players
        if len(a)==1: return a[0]
        total=len(a); t=self.vote_tally()
        for n,cnt in t.items():
            if cnt/total>0.5:
                p=self.player(n)
                if p and p.alive: return p
        return None

def assign_secrets(players):
    n=len(players); traitors=max(1,n//4); factious=max(1,n//3); deviants=n-traitors-factious
    pool=[3]*traitors+[2]*factious+[1]*deviants; random.shuffle(pool)
    for p,lvl in zip(players,pool): p.secret_level=lvl

def assign_clue_maps(players):
    for p in players:
        needed = p.secret_level + 1  # Deviant=2, Factious=3, Traitor=4
        indices = random.sample(range(6), needed)
        levels = list(range(1, needed + 1))
        random.shuffle(levels)
        p.clue_map = {idx: lvl for idx, lvl in zip(indices, levels)}

def do_bribe(p,recipient,target,mode):
    if mode=="vote":
        bl=""
        if p.has_discovered(recipient.name): bl=f"Lv{p.known_secrets[recipient.name]}"
        recipient.bribe_inbox.append({"type":"vote","target":target.name,"blackmail":bl})
    elif mode=="secret":
        lvl=p.known_secrets[target.name]
        recipient.bribe_inbox.append({"type":"secret","target":target.name,"level":lvl})
        recipient.clues_found.setdefault(target.name,set()).update(range(1,target.secret_level+2))
        recipient.known_secrets[target.name]=target.secret_level

def end_round(g:Game):
    a=g.alive_players
    if len(a)<=1: g.winner=a[0] if a else None; g.phase=Phase.GAME_OVER; return
    w=g.check_winner()
    if w: g.winner=w; g.phase=Phase.GAME_OVER; return
    g.round+=1; g.current_player_idx=0; g.pending_bribe_idx=0
    g.pending_vote_idx=0; g.pending_accuse_idx=0; g.votes={}
    g.spy_target=None; g.spy_result=None; g.bribe_mode=""; g._bribe_action=""
    for p in g.players: p.bribe_inbox=[]
    g.phase=Phase.ROUND_START

# ── UI helpers ─────────────────────────────────────────────────────────────────

def load_fonts():
    cands=["Georgia","Times New Roman","DejaVu Serif","FreeSerif"]
    def f(names,sz,bold=False):
        for n in names:
            try: fnt=pygame.font.SysFont(n,sz,bold=bold)
            except: continue
            if fnt: return fnt
        return pygame.font.Font(None,sz)
    return {
        "title": f(cands,42,True), "h2": f(cands,28,True), "h3": f(cands,22,True),
        "body": f(cands,18), "small": f(cands,14), "big": f(cands,56,True),
    }

class UI:
    def __init__(self,screen):
        self.screen=screen; self.fonts=load_fonts()
        self.buttons=[]; self.inputs=[]

    def clear(self):
        self.screen.fill(C_DARK)
        for y in range(0,H,4): pygame.draw.line(self.screen,(22,15,11),(0,y),(W,y))
        self.buttons.clear(); self.inputs.clear()

    def panel(self,rect,col=C_PANEL,border=C_BORDER,rad=6):
        pygame.draw.rect(self.screen,col,rect,border_radius=rad)
        pygame.draw.rect(self.screen,border,rect,2,border_radius=rad)

    def txt(self,text,fkey,col,x,y,cx=False,rx=False):
        s=self.fonts[fkey].render(str(text),True,col)
        r=s.get_rect()
        if cx: r.center=(x,y)
        elif rx: r.right,r.top=x,y
        else: r.topleft=(x,y)
        self.screen.blit(s,r); return r

    def btn(self,label,x,y,w=200,h=40,col=C_CRIMSON,hov=C_DARK_RED,tcol=C_CREAM,dis=False,fkey="body"):
        rect=pygame.Rect(x,y,w,h)
        mx,my=pygame.mouse.get_pos()
        hovered=rect.collidepoint(mx,my) and not dis
        bg=hov if hovered else col
        if dis: bg=C_MID
        pygame.draw.rect(self.screen,bg,rect,border_radius=5)
        pygame.draw.rect(self.screen,C_GOLD if hovered else C_BORDER,rect,2,border_radius=5)
        tc=C_GREY if dis else tcol
        self.txt(label,fkey,tc,rect.centerx,rect.centery,cx=True)
        self.buttons.append({"label":label,"rect":rect,"disabled":dis})
        return rect

    def header(self,title,sub=""):
        pygame.draw.rect(self.screen,C_DARK_RED,(0,0,W,72))
        pygame.draw.rect(self.screen,C_GOLD,(0,70,W,2))
        self.txt("★","h2",C_GOLD,28,18); self.txt("★","h2",C_GOLD,W-28,18,rx=True)
        self.txt(title,"h2",C_CREAM,W//2,26,cx=True)
        if sub: self.txt(sub,"small",C_GOLD,W//2,52,cx=True)

    def divider(self,y,col=C_BORDER):
        pygame.draw.line(self.screen,col,(40,y),(W-40,y),1)

    def input_field(self,label,x,y,w,value,active,tag):
        self.txt(label,"small",C_PARCHMENT,x,y-18)
        rect=pygame.Rect(x,y,w,32)
        bc=C_GOLD if active else C_BORDER
        pygame.draw.rect(self.screen,C_MID,rect,border_radius=4)
        pygame.draw.rect(self.screen,bc,rect,2,border_radius=4)
        disp=value+("|" if active and (pygame.time.get_ticks()//500)%2==0 else "")
        self.txt(disp,"body",C_CREAM,x+8,y+6)
        self.inputs.append({"tag":tag,"rect":rect})

    def hit(self,ev,label):
        if ev.type!=pygame.MOUSEBUTTONDOWN: return False
        for b in self.buttons:
            if b["label"]==label and not b["disabled"] and b["rect"].collidepoint(ev.pos): return True
        return False

    def hit_input(self,ev):
        if ev.type!=pygame.MOUSEBUTTONDOWN: return None
        for ib in self.inputs:
            if ib["rect"].collidepoint(ev.pos): return ib["tag"]
        return None

    def player_badge(self,p,x,y,w=200,h=80,show_secret=False):
        col=C_DARK_GRN if p.alive else C_MID
        self.panel((x,y,w,h),col,C_GOLD if p.alive else C_BORDER)
        sz=min(34,h//2-2)
        draw_portrait(self.screen,p.character,x+sz+4,y+h//2,sz)
        tx=x+sz*2+10
        self.txt(p.character,"small",C_GOLD,tx,y+8)
        self.txt(p.name,"body",C_CREAM,tx,y+26)
        if show_secret and p.secret_level:
            sc=SECRET_COLORS[p.secret_level]; sn=SECRET_NAMES[p.secret_level]
            self.txt(f"Lv{p.secret_level}: {sn}","small",sc,tx,y+48)
        elif not p.alive:
            self.txt("✖ PURGED","small",C_CRIMSON,tx,y+48)

# ── Carousel widget ────────────────────────────────────────────────────────────

class Carousel:
    """Shows one item at a time with ‹ › arrow buttons.
    items: list of Player objects (alive targets).
    selected: Player or None.
    """
    ARROW_W=60; CARD_H=260

    def __init__(self,items,selected=None):
        self.items=items; self._idx=0; self.selected=selected
        if selected and selected in items: self._idx=items.index(selected)

    def current(self): return self.items[self._idx] if self.items else None
    def prev(self): self._idx=(self._idx-1)%len(self.items)
    def next(self): self._idx=(self._idx+1)%len(self.items)

    def draw(self,ui:UI,cx,cy,extra_info=None):
        """Draw centred at (cx,cy). Returns button rects dict."""
        if not self.items: return {}
        item=self.current()
        card_w=300; ah=60
        card_x=cx-card_w//2; card_y=cy-self.CARD_H//2

        # background card
        sel=item is self.selected
        bg=C_DARK_GRN if sel else C_PANEL
        bc=C_GOLD if sel else C_BORDER
        pygame.draw.rect(ui.screen,bg,(card_x,card_y,card_w,self.CARD_H),border_radius=10)
        pygame.draw.rect(ui.screen,bc,(card_x,card_y,card_w,self.CARD_H),3,border_radius=10)

        # portrait
        draw_portrait(ui.screen,item.character,cx,card_y+100,80)
        ui.txt(item.character,"h3",C_GOLD,cx,card_y+188,cx=True)
        ui.txt(item.name,"h2",C_CREAM,cx,card_y+212,cx=True)
        if extra_info:
            ui.txt(extra_info,"small",C_GOLD,cx,card_y+238,cx=True)

        # dot indicators
        if len(self.items)>1:
            total=len(self.items); dot_r=5; gap=14
            dot_x=cx-(total-1)*gap//2
            for i in range(total):
                col=C_GOLD if i==self._idx else C_BORDER
                pygame.draw.circle(ui.screen,col,(int(dot_x+i*gap),int(card_y+self.CARD_H+14)),dot_r)
            ui.txt(f"{self._idx+1}/{total}","small",C_GREY,cx,card_y+self.CARD_H+28,cx=True)

        # arrows
        rects={}
        if len(self.items)>1:
            ax_l=card_x-self.ARROW_W-8; ax_r=card_x+card_w+8
            ay=cy-ah//2
            left_r=pygame.Rect(ax_l,ay,self.ARROW_W,ah)
            right_r=pygame.Rect(ax_r,ay,self.ARROW_W,ah)
            for r,lbl in [(left_r,"‹"),(right_r,"›")]:
                mx,my=pygame.mouse.get_pos()
                hov=r.collidepoint(mx,my)
                bg2=C_BORDER if hov else C_ARROW
                pygame.draw.rect(ui.screen,bg2,r,border_radius=8)
                pygame.draw.rect(ui.screen,C_GOLD if hov else C_BORDER,r,2,border_radius=8)
                ui.txt(lbl,"title",C_GOLD,r.centerx,r.centery,cx=True)
                ui.buttons.append({"label":lbl+"_carousel","rect":r,"disabled":False})
            rects={"left":left_r,"right":right_r}
        return rects

    def handle(self,ev):
        for b in [b for b in [] if True]: pass  # handled inline via hit
        if ev.type==pygame.MOUSEBUTTONDOWN:
            for btn in pygame.event.get.__self__ if False else []:
                pass
        # handled by draw + hit below

def carousel_hit(ui:UI,ev,carousel:Carousel):
    """Process arrow clicks. Returns True if event consumed."""
    if ev.type!=pygame.MOUSEBUTTONDOWN: return False
    for b in ui.buttons:
        if b["rect"].collidepoint(ev.pos):
            if b["label"]=="‹_carousel": carousel.prev(); return True
            if b["label"]=="›_carousel": carousel.next(); return True
    return False

# ── Spy option icons (pygame, drawn into 52×52 surfaces) ──────────────────────
_SPY_ICON_CACHE = {}

def _draw_spy_icon_0(s):  # Wire the phone
    _r(s,(42,28,14),14,8,24,36,5)
    _r(s,(26,42,26),17,13,18,8,2)
    for ix in range(3): _c(s,C_GOLD,22+ix*4,17,1)
    _c(s,(170,120,100),26,37,3)
    pygame.draw.arc(s,C_CRIMSON,pygame.Rect(0,20,18,24),math.radians(90),math.radians(270),2)
    pygame.draw.line(s,C_CRIMSON,(0,20),(14,20),2)
    pygame.draw.line(s,C_CRIMSON,(0,44),(14,44),2)
    _r(s,C_CRIMSON,0,27,10,8,2)
    _c(s,C_GOLD,5,31,2)
    pygame.draw.line(s,C_GOLD,(2,27),(1,22),1)
    pygame.draw.line(s,C_GOLD,(8,27),(9,22),1)

def _draw_spy_icon_1(s):  # Search the trash
    _r(s,(80,80,85),12,22,28,28,2)
    _r(s,(60,60,65),10,20,32,5,2)
    _p(s,C_CREAM,[(18,18),(22,8),(25,18)])
    _p(s,C_CREAM,[(28,18),(32,6),(35,18)])
    for y in [10,13,16]: pygame.draw.line(s,(160,140,100),(19,y),(21,y),1)
    for y in [8,11,14]:  pygame.draw.line(s,(160,140,100),(30,y),(33,y),1)
    _c(s,C_GOLD,38,16,9,2)
    _c(s,(20,16,10),38,16,6)
    pygame.draw.line(s,C_GOLD,(44,22),(50,30),3)

def _draw_spy_icon_2(s):  # Bribe a subordinate
    _p(s,(200,160,110),[(10,30),(10,44),(20,48),(28,44),(30,30),(24,28),(20,36),(16,28)])
    _p(s,(200,160,110),[(42,30),(42,44),(32,48),(24,44),(22,30),(28,28),(32,36),(36,28)])
    _r(s,(40,90,40),16,24,20,12,2)
    _c(s,C_GOLD,26,30,4)
    pygame.draw.line(s,C_GOLD,(26,27),(26,33),1)
    star=[]
    for k in range(5):
        a=math.radians(-90+72*k); b=math.radians(-90+72*k+36)
        star.append((26+6*math.cos(a),12+6*math.sin(a)))
        star.append((26+2.5*math.cos(b),12+2.5*math.sin(b)))
    _p(s,C_CRIMSON,star)

def _draw_spy_icon_3(s):  # Intercept the mail
    _r(s,C_CREAM,6,16,40,28,3)
    _p(s,C_PARCHMENT,[(6,16),(26,32),(46,16)])
    pygame.draw.rect(s,C_BORDER,(6,16,40,28),2,border_radius=3)
    _r(s,(245,235,200),14,8,24,20,2)
    pygame.draw.line(s,(160,140,100),(18,12),(34,12),1)
    pygame.draw.line(s,(160,140,100),(18,15),(34,15),1)
    pygame.draw.line(s,(160,140,100),(18,18),(28,18),1)
    _c(s,C_CRIMSON,36,38,6)
    _c(s,(220,180,40),36,38,3)
    _p(s,(200,155,100),[(44,30),(52,26),(54,34),(50,38),(44,36)])

def _draw_spy_icon_4(s):  # Follow at night
    _c(s,C_GOLD,42,10,8)
    _c(s,(18,12,10),46,8,7)
    pygame.draw.line(s,C_BORDER,(0,46),(52,46),1)
    _c(s,(60,50,40),12,28,5)
    _p(s,(60,50,40),[(8,34),(12,34),(16,34),(16,46),(8,46)])
    pygame.draw.line(s,(60,50,40),(8,34),(6,42),2)
    pygame.draw.line(s,(60,50,40),(16,34),(18,42),2)
    _c(s,(100,85,70),36,26,5)
    _p(s,(100,85,70),[(32,32),(36,32),(40,32),(40,46),(32,46)])
    for fx,fy in [(20,48),(24,46),(28,48),(32,46)]:
        _c(s,C_GOLD,fx,fy,2)

def _draw_spy_icon_5(s):  # Break into the office
    pygame.draw.rect(s,C_BORDER,(10,6,32,46),2)
    _r(s,(55,38,25),12,8,22,44,0)
    pygame.draw.rect(s,C_BORDER,(12,8,22,44),1)
    _c(s,C_GOLD,32,30,4)
    _c(s,C_BORDER,32,30,4,1)
    pygame.draw.line(s,(80,55,30),(34,8),(36,30),2)
    _p(s,C_GREY,[(36,4),(40,4),(40,8),(37,9)])
    pygame.draw.line(s,C_GREY,(38,8),(44,44),3)
    pygame.draw.line(s,(160,150,140),(38,8),(44,44),1)

_SPY_ICON_FNS = [
    _draw_spy_icon_0, _draw_spy_icon_1, _draw_spy_icon_2,
    _draw_spy_icon_3, _draw_spy_icon_4, _draw_spy_icon_5,
]

def get_spy_icon(idx:int) -> pygame.Surface:
    if idx not in _SPY_ICON_CACHE:
        surf = pygame.Surface((52,52), pygame.SRCALPHA)
        _SPY_ICON_FNS[idx](surf)
        _SPY_ICON_CACHE[idx] = surf
    return _SPY_ICON_CACHE[idx]


# We keep carousels alive across frames so index persists.
_carousels:dict[str,Carousel]={}

def get_carousel(key,items,selected=None):
    if key not in _carousels or [i.name for i in _carousels[key].items]!=[i.name for i in items]:
        _carousels[key]=Carousel(items,selected)
    return _carousels[key]

def reset_carousel(key):
    if key in _carousels: del _carousels[key]

# ── Screen drawers ─────────────────────────────────────────────────────────────

def draw_setup_players(ui:UI,g:Game):
    ui.header("DEATH IN THE KREMLIN","The Politburo convenes")
    ui.txt("Number of players:","h3",C_CREAM,W//2,90,cx=True)
    for i,n in enumerate([4,5,6]):
        sel=g.num_players==n
        ui.btn(str(n),W//2-100+i*90,112,70,36,
               col=C_DARK_RED if sel else C_MID,hov=C_CRIMSON)
    ui.txt("Player names:","h3",C_CREAM,W//2,165,cx=True)
    col_w=200; cols=2; sx=W//2-col_w-10
    for i in range(g.num_players):
        col=i%cols; row=i//cols
        x=sx+col*(col_w+20); y=196+row*58
        val=g.setup_names[i] if i<len(g.setup_names) else ""
        ui.input_field(f"Player {i+1}",x,y,col_w,val,g.active_input==i,i)
    all_named=all(g.setup_names[i].strip() for i in range(g.num_players))
    ui.btn("Continue →",W//2-100,H-70,200,44,
           col=C_CRIMSON if all_named else C_MID,dis=not all_named)

def draw_setup_chars(ui:UI,g:Game):
    current=g.current_player_idx
    if current>=g.num_players: return
    pname=g.setup_names[current]
    taken={g.setup_chars[i] for i in range(current) if g.setup_chars[i]}
    ui.header("CHARACTER SELECTION",f"{pname}, choose your role")
    cw,ch=265,130; cols=3; sx=W//2-(cols*cw+(cols-1)*8)//2
    for i,char in enumerate(CHARACTERS):
        cx2=sx+(i%cols)*(cw+8); cy2=88+(i//cols)*(ch+8)
        avail=char not in taken; sel=g.setup_chars[current]==char
        bg=C_DARK_RED if sel else (C_PANEL if avail else C_MID)
        bc=C_GOLD if sel else (C_BORDER if avail else (50,35,25))
        ui.panel((cx2,cy2,cw,ch),bg,bc)
        draw_portrait(ui.screen,char,cx2+60,cy2+ch//2,52)
        ui.txt(char,"h3",C_CREAM if avail else C_GREY,cx2+120,cy2+28)
        if not avail: ui.txt("(taken)","small",C_GREY,cx2+120,cy2+52)
        if avail: ui.buttons.append({"label":char,"rect":pygame.Rect(cx2,cy2,cw,ch),"disabled":False})
    chosen=g.setup_chars[current] is not None
    ui.btn("Confirm →",W//2-110,H-66,220,44,dis=not chosen)
    ui.txt(f"Player {current+1} of {g.num_players}","small",C_GREY,W//2,H-14,cx=True)

def draw_secret_deal(ui:UI,g:Game):
    current=g.current_player_idx; p=g.players[current]
    ui.header("SECRET DOSSIER","Eyes only — cover the screen")
    ui.txt(f"Pass the device to:  {p.character}  {p.name}","h3",C_GOLD,W//2,88,cx=True)
    ui.divider(110)
    if not g.secret_seen:
        draw_portrait(ui.screen,p.character,W//2,320,110)
        ui.btn("Reveal my secret dossier",W//2-170,460,340,48,col=C_DARK_RED,hov=C_CRIMSON)
    else:
        sc=SECRET_COLORS[p.secret_level]; sn=SECRET_NAMES[p.secret_level]
        draw_portrait(ui.screen,p.character,W//2-220,310,110)
        ui.panel((W//2-50,200,340,200),C_PANEL,C_GOLD)
        ui.txt("YOUR SECRET","small",C_GOLD,W//2+120,220,cx=True)
        ui.txt(f"Level {p.secret_level}: {sn}","h2",sc,W//2+120,260,cx=True)
        descs={1:"Two clues expose you.",2:"Three clues expose you.",3:"Four clues expose you."}
        ui.txt(descs[p.secret_level],"small",C_PARCHMENT,W//2+120,300,cx=True)
        ui.btn("Understood — pass the device",W//2-170,430,340,44,col=C_GREEN,hov=C_DARK_GRN)
    ui.txt(f"Comrade {current+1} of {len(g.players)}","small",C_GREY,W//2,H-14,cx=True)

def draw_round_start(ui:UI,g:Game):
    alive=g.alive_players
    ui.header(f"ROUND {g.round}",f"{len(alive)} members in session")
    bw,bh=220,96; cols=min(3,len(alive)); sx=W//2-(cols*(bw+10))//2+5
    for i,p in enumerate(alive):
        bx=sx+(i%cols)*(bw+10); by=90+(i//cols)*(bh+10)
        ui.player_badge(p,bx,by,bw,bh)
    steps_y=90+(((len(alive)-1)//cols)+1)*(bh+10)+10
    for i,s in enumerate(["Step 1: Espionage","Step 2: Anonymous Message","Step 3: Public Vote","Step 4: Accusations"]):
        ui.txt(s,"h3",C_GOLD,80,steps_y+i*30)
    ui.btn("Begin Round →",W//2-120,H-70,240,48,col=C_CRIMSON)

def draw_spy_choose(ui:UI,g:Game):
    p=g.current_player()
    ui.header("STEP 1: ESPIONAGE",f"Round {g.round}")
    ui.txt(f"{p.character}  {p.name} — choose a target","h3",C_CREAM,W//2,82,cx=True)
    targets=[t for t in g.alive_players if t is not p]
    if not targets: return
    car=get_carousel("spy_choose",targets)
    item=car.current()
    disc=p.has_discovered(item.name) if item else False
    extra=f"★ {SECRET_NAMES[p.known_secrets[item.name]]} known" if disc and item else None
    car.draw(ui,W//2,H//2-20,extra_info=extra)
    # confirm button
    ui.btn("Spy on this player →",W//2-130,H-70,260,46,col=C_CRIMSON)
    ui.txt(f"Your character: {p.character}","small",C_GREY,20,H-18)

def draw_spy_method(ui:UI,g:Game):
    p=g.current_player(); t=g.spy_target
    ui.header("STEP 1: CHOOSE METHOD",f"Spying on {t.name}")
    # corner portraits
    draw_portrait(ui.screen,p.character,60,120,55)
    ui.txt(p.name,"small",C_PARCHMENT,60,182,cx=True)
    draw_portrait(ui.screen,t.character,W-60,120,55)
    ui.txt(t.name,"small",C_PARCHMENT,W-60,182,cx=True)
    # spy options 2 per row — taller cards with icon
    bw,bh=340,58; sx=(W-bw*2-12)//2
    for i,opt in enumerate(SPY_OPTIONS):
        col=i%2; row=i//2
        bx=sx+col*(bw+12); by=206+row*(bh+8)
        used=not p.can_spy_with(t.name,i)
        bg=C_MID if used else C_PANEL; bc=C_BORDER if used else C_GOLD
        pygame.draw.rect(ui.screen,bg,(bx,by,bw,bh),border_radius=5)
        pygame.draw.rect(ui.screen,bc,(bx,by,bw,bh),2,border_radius=5)
        # icon
        icon=get_spy_icon(i)
        if used:
            dim=icon.copy(); dim.set_alpha(80)
            ui.screen.blit(dim,(bx+8,by+bh//2-26))
        else:
            ui.screen.blit(icon,(bx+8,by+bh//2-26))
        tc=C_GREY if used else C_CREAM
        ui.txt(opt,"body",tc,bx+68,by+bh//2-9)
        if used: ui.txt("(used)","small",(80,60,50),bx+bw-60,by+bh//2-7)
        if not used: ui.buttons.append({"label":opt,"rect":pygame.Rect(bx,by,bw,bh),"disabled":False})
    ui.btn("← Back",30,H-60,110,38,col=C_MID,hov=C_BORDER)

def draw_spy_result(ui:UI,g:Game):
    p=g.current_player(); sr=g.spy_result; t=g.player(sr["target"]) if sr else None
    ui.header("ESPIONAGE RESULT","For your eyes only")
    if t: draw_portrait(ui.screen,t.character,W//2,240,105)
    if t: ui.txt(f"{t.character}  {t.name}","h3",C_GOLD,W//2,352,cx=True)
    if sr:
        res=sr["result"]
        if res=="secret":
            lvl=sr.get("secret_level",1)
            ui.panel((W//2-280,376,560,58),C_DARK_RED,C_GOLD)
            ui.txt(f"SECRET UNCOVERED: {SECRET_NAMES[lvl]}  (Level {lvl})","h3",SECRET_COLORS[lvl],W//2,403,cx=True)
        elif res=="clue":
            ui.panel((W//2-220,376,440,52),C_PANEL,C_GOLD)
            ui.txt("A clue was found.","h2",C_GOLD,W//2,399,cx=True)
        else:
            ui.panel((W//2-240,376,480,52),C_PANEL,C_BORDER)
            ui.txt("Nothing of note was found.","h2",C_GREY,W//2,399,cx=True)
    ui.btn("Continue →",W//2-100,H-66,200,44)

def draw_bribe_choose(ui:UI,g:Game):
    alive=g.alive_players
    p=alive[g.pending_bribe_idx] if g.pending_bribe_idx<len(alive) else alive[0]
    ui.header("STEP 2: ANONYMOUS MESSAGE",f"Round {g.round}")
    ui.txt(f"Pass the device to:  {p.character}  {p.name}","h3",C_GOLD,W//2,82,cx=True)
    ui.divider(108)

    mode=g.bribe_mode   # "": choose action  |  "pick_rec": pick recipient
                         # "vote"/"secret": pick target (recipient already set)

    # ── sub-step 1: choose action ─────────────────────────────────────────────
    if mode=="":
        ui.txt("Choose your anonymous action:","h3",C_CREAM,W//2,130,cx=True)
        ui.btn("Send a voting instruction",W//2-210,200,420,52,col=C_DARK_BLU,hov=C_BLUE)
        known_targets=[t for t in alive if t is not p and p.has_discovered(t.name)]
        ui.btn("Share a discovered secret",W//2-210,264,420,52,
               col=C_DARK_GRN if known_targets else C_MID,
               hov=C_GREEN if known_targets else C_MID,
               dis=not known_targets)
        ui.btn("Skip (do nothing)",W//2-210,328,420,44,col=C_MID)

    # ── sub-step 2: pick recipient ─────────────────────────────────────────────
    elif mode=="pick_rec":
        others=[t for t in alive if t is not p]
        car=get_carousel("bribe_rec",others,g.bribe_recipient)
        item=car.current()
        act_lbl="voting instruction" if g._bribe_action=="vote" else "secret"
        ui.txt(f"Who receives your {act_lbl}?","h3",C_CREAM,W//2,126,cx=True)
        known_rec=p.has_discovered(item.name) if item else False
        extra=(f"☭ blackmail Lv{p.known_secrets[item.name]}"
               if known_rec and g._bribe_action=="vote" else None)
        car.draw(ui,W//2,H//2-10,extra_info=extra)
        ui.btn("Send to this player →",W//2-130,H-120,260,44,col=C_GOLD,tcol=C_DARK)
        ui.btn("← Back",30,H-60,110,38,col=C_MID)

    # ── sub-step 3a: pick vote target ──────────────────────────────────────────
    elif mode=="vote":
        rec=g.bribe_recipient
        ui.txt(f"Ask {rec.name} to vote for whom?","h3",C_CREAM,W//2,126,cx=True)
        car=get_carousel("bribe_vtgt",alive,g.bribe_target)
        item=car.current()
        car.draw(ui,W//2,H//2-10)
        ready=item is not None
        col=C_DARK_BLU if ready else C_MID
        ui.btn("Send instruction →",W//2-130,H-120,260,44,col=col,hov=C_BLUE,dis=not ready)
        ui.btn("← Back",30,H-60,110,38,col=C_MID)

    # ── sub-step 3b: pick secret target ───────────────────────────────────────
    elif mode=="secret":
        rec=g.bribe_recipient
        known_targets=[t for t in alive if t is not p and p.has_discovered(t.name)]
        ui.txt(f"Share whose secret with {rec.name}?","h3",C_CREAM,W//2,126,cx=True)
        if known_targets:
            car=get_carousel("bribe_stgt",known_targets,g.bribe_target)
            item=car.current()
            lvl=p.known_secrets.get(item.name,0) if item else 0
            extra=f"Lv{lvl}: {SECRET_NAMES.get(lvl,'')}" if lvl else None
            car.draw(ui,W//2,H//2-10,extra_info=extra)
            ready=item is not None
            ui.btn("Share secret →",W//2-130,H-120,260,44,
                   col=C_DARK_GRN if ready else C_MID,hov=C_GREEN,dis=not ready)
        ui.btn("← Back",30,H-60,110,38,col=C_MID)


def draw_vote(ui:UI,g:Game):
    alive=g.alive_players
    p=alive[g.pending_vote_idx] if g.pending_vote_idx<len(alive) else alive[0]
    ui.header("STEP 3: PUBLIC VOTE",f"Round {g.round}")
    ui.txt(f"{p.character}  {p.name} — cast your vote","h3",C_CREAM,W//2,82,cx=True)
    inbox=p.bribe_inbox
    iy=100
    for msg in inbox:
        if msg["type"]=="vote":
            text=f"Vote for {msg['target']}"+(f"  ⚑ BLACKMAIL" if msg.get("blackmail") else "")
            bcol=C_DARK_RED if msg.get("blackmail") else C_PANEL; bord=C_GOLD if msg.get("blackmail") else C_BORDER
            ui.panel((40,iy,W-80,32),bcol,bord)
            ui.txt(text,"body",C_GOLD if msg.get("blackmail") else C_CREAM,W//2,iy+8,cx=True)
        else:
            lvl=msg.get("level",1)
            is_self=msg["target"]==p.name
            bcol=(100,8,8) if is_self else C_PANEL
            text=(f"⚑ THREAT: your secret is known — Lv{lvl}: {SECRET_NAMES[lvl]}" if is_self
                  else f"Tip: {msg['target']} is Lv{lvl}: {SECRET_NAMES[lvl]}")
            ui.panel((40,iy,W-80,32),bcol,C_GOLD if is_self else C_BORDER)
            ui.txt(text,"body",SECRET_COLORS.get(lvl,C_GOLD),W//2,iy+8,cx=True)
        iy+=40
    car=get_carousel("vote",alive,None)
    item=car.current()
    car.draw(ui,W//2,max(iy+30,320)+80)
    voted=g.votes.get(p.name)
    lbl="✔ Vote for this player" if item and voted==item.name else "Vote for this player"
    col=C_DARK_GRN if item and voted==item.name else C_CRIMSON
    ui.btn(lbl,W//2-130,H-120,260,44,col=col)
    ui.btn("Confirm vote →",W//2-100,H-66,200,44,
           dis=(p.name not in g.votes),col=C_CRIMSON)

def draw_vote_result(ui:UI,g:Game):
    alive=g.alive_players; tally=g.vote_tally(); total=len(alive)
    ui.header("VOTE RESULTS",f"Round {g.round}")
    sorted_t=sorted(tally.items(),key=lambda x:-x[1])
    bx=200; bw_max=560
    for i,(name,cnt) in enumerate(sorted_t):
        y=100+i*64; pct=cnt/total; majority=pct>0.5
        pl=g.player(name)
        if pl: draw_portrait(ui.screen,pl.character,bx-50,y+24,22)
        ui.txt(name,"body",C_CREAM,bx-12,y+10,rx=True)
        pygame.draw.rect(ui.screen,C_PANEL,(bx,y,bw_max,40),border_radius=4)
        fc=C_CRIMSON if majority else C_DARK_BLU
        fw=max(4,int(bw_max*pct))
        pygame.draw.rect(ui.screen,fc,(bx,y,fw,40),border_radius=4)
        pygame.draw.rect(ui.screen,C_GOLD if majority else C_BORDER,(bx,y,bw_max,40),2,border_radius=4)
        ui.txt(f"{cnt} vote{'s' if cnt!=1 else ''}","small",C_GOLD,bx+fw+8,y+12)
        if majority: ui.txt("★ MAJORITY","small",C_GOLD,bx+fw+8,y+26)
    if g.winner_candidate:
        wp=g.winner_candidate
        ui.panel((W//2-280,H-130,560,54),C_DARK_RED,C_GOLD)
        ui.txt(f"★  {wp.name} commands a majority!","h3",C_GOLD,W//2,H-106,cx=True)
    ui.btn("Proceed to Accusations →",W//2-160,H-66,320,44)

def draw_accuse_choose(ui:UI,g:Game):
    alive=g.alive_players
    p=alive[g.pending_accuse_idx] if g.pending_accuse_idx<len(alive) else alive[0]
    ui.header("STEP 4: ACCUSATIONS",f"Round {g.round}")
    ui.txt(f"{p.character}  {p.name} — you may accuse one player","h3",C_CREAM,W//2,82,cx=True)
    accusable=[t for t in alive if t is not p and p.has_discovered(t.name)]
    if accusable:
        car=get_carousel("accuse",accusable,g.accuse_target)
        item=car.current()
        lvl=p.known_secrets.get(item.name,0) if item else 0
        extra=f"Lv{lvl}: {SECRET_NAMES[lvl]}" if lvl else None
        car.draw(ui,W//2,340,extra_info=extra)
        lbl="✔ Accuse this player" if item is g.accuse_target else "Select to accuse"
        bcol=C_DARK_RED if item is g.accuse_target else C_MID
        ui.btn(lbl,W//2-130,H-128,260,40,col=bcol)
        ui.btn("Accuse →",W//2-200,H-76,180,44,dis=(g.accuse_target is None),col=C_CRIMSON)
    else:
        ui.txt("No targets — no secrets uncovered yet.","body",C_GREY,W//2,340,cx=True)
    ui.btn("Pass (no accusation)",W//2+10,H-76,220,44,col=C_MID)
    ui.txt(f"Player {g.pending_accuse_idx+1} of {len(alive)}","small",C_GREY,W//2,H-18,cx=True)

def draw_accuse_respond(ui:UI,g:Game):
    accuser,accused,acc_level=g.current_accusation
    ui.header("STEP 4: ACCUSATION",f"Round {g.round}")
    draw_portrait(ui.screen,accuser.character,W//4,220,80)
    ui.txt(accuser.character,"small",C_PARCHMENT,W//4,308,cx=True)
    ui.txt(accuser.name,"body",C_CREAM,W//4,326,cx=True)
    draw_portrait(ui.screen,accused.character,3*W//4,220,80)
    ui.txt(accused.character,"small",C_PARCHMENT,3*W//4,308,cx=True)
    ui.txt(accused.name,"body",C_CREAM,3*W//4,326,cx=True)
    ui.panel((W//2-360,100,720,66),C_DARK_RED,C_GOLD)
    ui.txt(f"☭  {accuser.name}  accuses  {accused.name}","h3",C_GOLD,W//2,116,cx=True)
    ui.txt(f"Level {acc_level}: {SECRET_NAMES[acc_level]}","h2",SECRET_COLORS[acc_level],W//2,148,cx=True)
    ui.divider(358)
    ui.txt(f"Pass the device to:  {accused.character}  {accused.name}","h3",C_CREAM,W//2,368,cx=True)
    can_counter=accuser.name in accused.known_secrets
    if can_counter:
        cl=accused.known_secrets[accuser.name]
        ui.panel((W//2-260,394,520,46),C_PANEL,C_GOLD)
        ui.txt(f"You know their secret — Lv{cl}: {SECRET_NAMES[cl]}","body",SECRET_COLORS[cl],W//2,416,cx=True)
        ui.btn("Counter-accuse →",W//2-220,H-70,208,44,col=C_CRIMSON)
        ui.btn("Accept (do not counter)",W//2+18,H-70,222,44,col=C_MID)
    else:
        ui.txt("You cannot counter — no knowledge of their secret.","body",C_GREY,W//2,400,cx=True)
        ui.btn("Accept fate",W//2-110,H-70,220,44,col=C_MID)

def draw_accuse_outcome(ui:UI,g:Game):
    ui.header("ACCUSATION OUTCOME",f"Round {g.round}")
    lines=g.accuse_outcome.get("lines",[])
    y=160
    for ln in lines:
        col=(C_CRIMSON if "PURGED" in ln else C_GOLD if "survive" in ln or "cancel" in ln else C_CREAM)
        ui.txt(ln,"h3" if y<200 else "body",col,W//2,y,cx=True)
        y+=44
    ui.btn("Continue →",W//2-100,H-70,200,44)

def draw_game_over(ui:UI,g:Game):
    pygame.draw.rect(ui.screen,C_DARK_RED,(0,0,W,H))
    pygame.draw.rect(ui.screen,C_GOLD,(0,0,W,H),4)
    ui.txt("☭","big",C_GOLD,W//2,50,cx=True)
    if g.winner:
        ui.txt("GENERAL SECRETARY ELECTED","h2",C_GOLD,W//2,138,cx=True)
        draw_portrait(ui.screen,g.winner.character,W//2,238,90)
        ui.txt(g.winner.character,"h3",C_GOLD,W//2,334,cx=True)
        ui.txt(g.winner.name,"title",C_CREAM,W//2,362,cx=True)
    ui.divider(408)
    ui.txt("Final dossiers:","h3",C_GOLD,W//2,416,cx=True)
    bw,bh=200,80; sx=W//2-(min(3,len(g.players))*(bw+8))//2+4
    for i,p in enumerate(g.players):
        bx=sx+(i%3)*(bw+8); by=442+(i//3)*(bh+8)
        ui.player_badge(p,bx,by,bw,bh,show_secret=True)
    ui.btn("★  Play Again  ★",W//2-130,H-60,260,46,col=C_CRIMSON)

# ── Main loop ──────────────────────────────────────────────────────────────────

def main():
    pygame.init()
    screen=pygame.display.set_mode((W,H))
    pygame.display.set_caption("Death in the Kremlin")
    clock=pygame.time.Clock()
    game=Game(); ui=UI(screen); running=True

    while running:
        events=pygame.event.get()
        for ev in events:
            if ev.type==pygame.QUIT: running=False

            g=game

            # ── setup players ───────────────────────────────────────────────
            if g.phase==Phase.SETUP_PLAYERS:
                tag=ui.hit_input(ev)
                if tag is not None: g.active_input=tag
                if ev.type==pygame.KEYDOWN and g.active_input>=0:
                    idx=g.active_input
                    while len(g.setup_names)<=idx: g.setup_names.append("")
                    if ev.key==pygame.K_BACKSPACE: g.setup_names[idx]=g.setup_names[idx][:-1]
                    elif ev.key in (pygame.K_RETURN,pygame.K_TAB):
                        g.active_input=(idx+1)%g.num_players
                    elif len(g.setup_names[idx])<14: g.setup_names[idx]+=ev.unicode
                for n in [4,5,6]:
                    if ui.hit(ev,str(n)): g.num_players=n; g.active_input=-1
                if ui.hit(ev,"Continue →"):
                    g.players=[Player(name=g.setup_names[i].strip() or f"P{i+1}")
                                for i in range(g.num_players)]
                    g.phase=Phase.SETUP_CHARS; g.current_player_idx=0

            # ── setup chars ─────────────────────────────────────────────────
            elif g.phase==Phase.SETUP_CHARS:
                taken={g.setup_chars[i] for i in range(g.current_player_idx) if g.setup_chars[i]}
                for char in CHARACTERS:
                    if char not in taken and ui.hit(ev,char):
                        g.setup_chars[g.current_player_idx]=char
                if ui.hit(ev,"Confirm →") and g.setup_chars[g.current_player_idx]:
                    g.players[g.current_player_idx].character=g.setup_chars[g.current_player_idx]
                    g.current_player_idx+=1
                    if g.current_player_idx>=g.num_players:
                        assign_secrets(g.players); assign_clue_maps(g.players)
                        g.current_player_idx=0; g.secret_seen=False
                        g.phase=Phase.SECRET_DEAL

            # ── secret deal ─────────────────────────────────────────────────
            elif g.phase==Phase.SECRET_DEAL:
                if ui.hit(ev,"Reveal my secret dossier"): g.secret_seen=True
                if ui.hit(ev,"Understood — pass the device"):
                    g.current_player_idx+=1; g.secret_seen=False
                    if g.current_player_idx>=len(g.players):
                        g.phase=Phase.ROUND_START

            # ── round start ─────────────────────────────────────────────────
            elif g.phase==Phase.ROUND_START:
                if ui.hit(ev,"Begin Round →"):
                    g.current_player_idx=0; g.spy_target=None; g.spy_result=None
                    _carousels.clear(); g.phase=Phase.SPY_CHOOSE

            # ── spy choose ──────────────────────────────────────────────────
            elif g.phase==Phase.SPY_CHOOSE:
                p=g.current_player()
                targets=[t for t in g.alive_players if t is not p]
                car=get_carousel("spy_choose",targets)
                if carousel_hit(ui,ev,car): pass
                elif ui.hit(ev,"Spy on this player →"):
                    g.spy_target=car.current(); reset_carousel("spy_choose")
                    g.phase=Phase.SPY_METHOD

            # ── spy method ──────────────────────────────────────────────────
            elif g.phase==Phase.SPY_METHOD:
                p=g.current_player(); t=g.spy_target
                if ui.hit(ev,"← Back"):
                    g.spy_target=None; g.phase=Phase.SPY_CHOOSE
                else:
                    for i,opt in enumerate(SPY_OPTIONS):
                        if ui.hit(ev,opt) and p.can_spy_with(t.name,i):
                            was=p.has_discovered(t.name)
                            p.record_spy(t,i)
                            cl=p.clue_map.get(i)
                            if p.has_discovered(t.name) and not was:
                                res="secret"; lvl=p.known_secrets[t.name]
                                g.spy_result={"result":res,"target":t.name,"secret_level":lvl}
                            elif cl and cl<=t.secret_level:
                                g.spy_result={"result":"clue","target":t.name}
                            else:
                                g.spy_result={"result":"nothing","target":t.name}
                            g.phase=Phase.SPY_RESULT; break

            # ── spy result ──────────────────────────────────────────────────
            elif g.phase==Phase.SPY_RESULT:
                if ui.hit(ev,"Continue →"):
                    alive=g.alive_players; cur=g.current_player()
                    idx=alive.index(cur)+1
                    if idx>=len(alive):
                        g.pending_bribe_idx=0; g.bribe_mode=""; g._bribe_action=""
                        g.bribe_recipient=None; g.bribe_target=None
                        for p in g.players: p.bribe_inbox=[]
                        _carousels.clear(); g.phase=Phase.BRIBE_CHOOSE
                    else:
                        g.current_player_idx=idx; g.spy_target=None; g.spy_result=None
                        reset_carousel("spy_choose"); g.phase=Phase.SPY_CHOOSE

            # ── bribe choose ─────────────────────────────────────────────────
            elif g.phase==Phase.BRIBE_CHOOSE:
                alive=g.alive_players
                if g.pending_bribe_idx>=len(alive):
                    g.pending_vote_idx=0; g.votes={}; _carousels.clear(); g.phase=Phase.VOTE
                else:
                    p=alive[g.pending_bribe_idx]
                    others=[t for t in alive if t is not p]

                    def adv_bribe():
                        g.pending_bribe_idx+=1; g.bribe_recipient=None
                        g.bribe_target=None; g.bribe_mode=""; g._bribe_action=""
                        for k in ("bribe_rec","bribe_vtgt","bribe_stgt"): _carousels.pop(k,None)
                        if g.pending_bribe_idx>=len(g.alive_players):
                            g.pending_vote_idx=0; g.votes={}; g.phase=Phase.VOTE

                    mode=g.bribe_mode
                    if mode=="":
                        # sub-step 1: choose action
                        if ui.hit(ev,"Send a voting instruction"):
                            g._bribe_action="vote"; g.bribe_mode="pick_rec"
                            _carousels.pop("bribe_rec",None)
                        elif ui.hit(ev,"Share a discovered secret"):
                            g._bribe_action="secret"; g.bribe_mode="pick_rec"
                            _carousels.pop("bribe_rec",None)
                        elif ui.hit(ev,"Skip (do nothing)"): adv_bribe()

                    elif mode=="pick_rec":
                        # sub-step 2: pick recipient
                        rec_car=get_carousel("bribe_rec",others,g.bribe_recipient)
                        if not carousel_hit(ui,ev,rec_car):
                            if ui.hit(ev,"Send to this player →"):
                                g.bribe_recipient=rec_car.current()
                                g.bribe_mode=g._bribe_action  # advance to target step
                                _carousels.pop("bribe_vtgt",None); _carousels.pop("bribe_stgt",None)
                            elif ui.hit(ev,"← Back"):
                                g.bribe_mode=""; g._bribe_action=""

                    elif mode=="vote":
                        # sub-step 3a: pick vote target
                        v_car=get_carousel("bribe_vtgt",alive,g.bribe_target)
                        if not carousel_hit(ui,ev,v_car):
                            item=v_car.current()
                            if ui.hit(ev,"Send instruction →") and item:
                                g.bribe_target=item
                                do_bribe(p,g.bribe_recipient,g.bribe_target,"vote"); adv_bribe()
                            elif ui.hit(ev,"← Back"):
                                g.bribe_mode="pick_rec"; g.bribe_target=None
                                _carousels.pop("bribe_vtgt",None)

                    elif mode=="secret":
                        # sub-step 3b: pick secret target
                        known_targets=[t for t in alive if t is not p and p.has_discovered(t.name)]
                        if known_targets:
                            s_car=get_carousel("bribe_stgt",known_targets,g.bribe_target)
                            if not carousel_hit(ui,ev,s_car):
                                item=s_car.current()
                                if ui.hit(ev,"Share secret →") and item:
                                    g.bribe_target=item
                                    do_bribe(p,g.bribe_recipient,g.bribe_target,"secret"); adv_bribe()
                        if ui.hit(ev,"← Back"):
                            g.bribe_mode="pick_rec"; g.bribe_target=None
                            _carousels.pop("bribe_stgt",None)

            # ── vote ────────────────────────────────────────────────────────
            elif g.phase==Phase.VOTE:
                alive=g.alive_players
                if g.pending_vote_idx>=len(alive):
                    g.winner_candidate=g.check_winner(); g.phase=Phase.VOTE_RESULT
                else:
                    voter=alive[g.pending_vote_idx]
                    car=get_carousel("vote",alive)
                    if carousel_hit(ui,ev,car): pass
                    item=car.current()
                    if ui.hit(ev,"Vote for this player") or ui.hit(ev,"✔ Vote for this player"):
                        if item: g.votes[voter.name]=item.name
                    if ui.hit(ev,"Confirm vote →") and voter.name in g.votes:
                        g.pending_vote_idx+=1; reset_carousel("vote")
                        if g.pending_vote_idx>=len(alive):
                            g.winner_candidate=g.check_winner(); g.phase=Phase.VOTE_RESULT

            # ── vote result ─────────────────────────────────────────────────
            elif g.phase==Phase.VOTE_RESULT:
                if ui.hit(ev,"Proceed to Accusations →"):
                    w=g.check_winner()
                    if w: g.winner=w; g.phase=Phase.GAME_OVER
                    else: g.pending_accuse_idx=0; g.accuse_target=None; _carousels.pop("accuse",None); g.phase=Phase.ACCUSE_CHOOSE

            # ── accuse choose ───────────────────────────────────────────────
            elif g.phase==Phase.ACCUSE_CHOOSE:
                alive=g.alive_players
                if g.pending_accuse_idx<len(alive):
                    p=alive[g.pending_accuse_idx]
                    accusable=[t for t in alive if t is not p and p.has_discovered(t.name)]
                    if accusable:
                        car=get_carousel("accuse",accusable,g.accuse_target)
                        if carousel_hit(ui,ev,car): pass
                        item=car.current()
                        if ui.hit(ev,"Select to accuse") or ui.hit(ev,"✔ Accuse this player"):
                            g.accuse_target=item
                        if ui.hit(ev,"Accuse →") and g.accuse_target:
                            lvl=p.known_secrets[g.accuse_target.name]
                            g.current_accusation=(p,g.accuse_target,lvl)
                            g.pending_accuse_idx+=1; g.accuse_target=None
                            _carousels.pop("accuse",None); g.phase=Phase.ACCUSE_RESPOND
                    if ui.hit(ev,"Pass (no accusation)"):
                        g.pending_accuse_idx+=1; g.accuse_target=None; _carousels.pop("accuse",None)
                        if g.pending_accuse_idx>=len(alive): end_round(g)

            # ── accuse respond ──────────────────────────────────────────────
            elif g.phase==Phase.ACCUSE_RESPOND:
                accuser,accused,acc_level=g.current_accusation
                can_counter=accuser.name in accused.known_secrets
                if ui.hit(ev,"Counter-accuse →") and can_counter:
                    cl=accused.known_secrets[accuser.name]
                    if acc_level==cl:
                        lines=[f"{accuser.name} accused {accused.name}",
                               f"{accused.name} counter-accuses!","Same level — both survive."]
                    elif cl>acc_level:
                        accuser.alive=False
                        lines=[f"{accuser.name} accused {accused.name}",
                               f"{accused.name} counter-accuses!",f"{accuser.name} — PURGED."]
                    else:
                        accused.alive=False
                        lines=[f"{accuser.name} accused {accused.name}",
                               f"{accused.name} counter-accuses!",f"{accused.name} — PURGED."]
                    g.accuse_outcome={"lines":lines}; g.phase=Phase.ACCUSE_OUTCOME
                elif ui.hit(ev,"Accept fate") or ui.hit(ev,"Accept (do not counter)"):
                    accused.alive=False
                    g.accuse_outcome={"lines":[f"{accuser.name} accused {accused.name}",
                                               f"{accused.name} accepts — PURGED."]}
                    g.phase=Phase.ACCUSE_OUTCOME

            # ── accuse outcome ──────────────────────────────────────────────
            elif g.phase==Phase.ACCUSE_OUTCOME:
                if ui.hit(ev,"Continue →"):
                    alive=g.alive_players
                    if g.pending_accuse_idx>=len(alive): end_round(g)
                    else: g.phase=Phase.ACCUSE_CHOOSE

            # ── game over ───────────────────────────────────────────────────
            elif g.phase==Phase.GAME_OVER:
                if ui.hit(ev,"★  Play Again  ★"):
                    game=Game(); g=game; _carousels.clear(); ui.buttons.clear()

        # ── draw ────────────────────────────────────────────────────────────
        ui.clear()
        draws={
            Phase.SETUP_PLAYERS: draw_setup_players,
            Phase.SETUP_CHARS:   draw_setup_chars,
            Phase.SECRET_DEAL:   draw_secret_deal,
            Phase.ROUND_START:   draw_round_start,
            Phase.SPY_CHOOSE:    draw_spy_choose,
            Phase.SPY_METHOD:    draw_spy_method,
            Phase.SPY_RESULT:    draw_spy_result,
            Phase.BRIBE_CHOOSE:  draw_bribe_choose,
            Phase.VOTE:          draw_vote,
            Phase.VOTE_RESULT:   draw_vote_result,
            Phase.ACCUSE_CHOOSE: draw_accuse_choose,
            Phase.ACCUSE_RESPOND:draw_accuse_respond,
            Phase.ACCUSE_OUTCOME:draw_accuse_outcome,
            Phase.GAME_OVER:     draw_game_over,
        }
        fn=draws.get(game.phase)
        try:
            if fn: fn(ui,game)
        except Exception as e:
            import traceback
            with open("/tmp/kremlin_crash.txt","w") as f:
                f.write(f"Phase: {game.phase}\n")
                f.write(traceback.format_exc())
            raise
        pygame.display.flip(); clock.tick(60)

    pygame.quit(); sys.exit()

if __name__=="__main__":
    main()
