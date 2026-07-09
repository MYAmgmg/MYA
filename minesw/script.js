const heartArea = document.querySelector(".heart-bg");
const hearts = ["♡","♥","♡","♥"];

function createHeart(){
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = hearts[Math.floor(Math.random()*hearts.length)];

    // ランダム位置
    heart.style.left = Math.random()*100 + "vw";

    // サイズ
    const size = Math.random()*25 + 15;
    heart.style.fontSize = size + "px";

    // 透明度
    heart.style.opacity = Math.random()*0.25 + 0.05;

    heart.style.setProperty(
    "--sway",
    (Math.random()*60-30)+"px"
    );

    // スピード
    const duration = Math.random()*15 + 20;
    heart.style.animationDuration = duration + "s";

    // 開始位置をずらす
    heart.style.animationDelay = 
        Math.random()*-20 + "s";

    heartArea.appendChild(heart);

    // 古いものを削除
    setTimeout(()=>{
        heart.remove();
    },(duration+5)*1000);
}

// 常に生成
setInterval(createHeart,500);

// 最初から大量配置
for(let i=0;i<15;i++){
    createHeart();
}

let WIDTH = 16;
let HEIGHT = 25;
let MINES = 99;

let cells = [];
let gameOver = false;
let isFlagMode = false; 
let isFirstClick = true;

const board = document.getElementById("board");
const restart = document.getElementById("restart");
const message = document.getElementById("message");
const flags = document.getElementById("flags");
const flagModeBtn = document.getElementById("flag-mode-btn"); 

document.querySelectorAll("#difficulty button").forEach(btn => {
    btn.onclick = () => {
        const size = Number(btn.dataset.size);
        WIDTH = size;
        HEIGHT = btn.dataset.height ? Number(btn.dataset.height) : size;
        MINES = Number(btn.dataset.mines);
        init();
    };
});

restart.onclick = init;

// フラッグモードボタンの切り替え処理
flagModeBtn.onclick = () => {
    if (gameOver) return;
    isFlagMode = !isFlagMode;
    updateFlagModeButton();
};

// ボタンの見た目を更新する関数
function updateFlagModeButton() {
    if (isFlagMode) {
        flagModeBtn.textContent = "はた";
        flagModeBtn.classList.add("active");
    } else {
        flagModeBtn.textContent = "掘る";
        flagModeBtn.classList.remove("active");
    }
}

// ★ここが新しくなった init 関数です！消えていたセル生成コードを復活させました
function init(){
    message.textContent = "";
    board.innerHTML="";
    board.style.setProperty("--width", WIDTH);
    board.style.setProperty("--height", HEIGHT);
    cells=[];
    gameOver=false;
    isFlagMode = false;
    updateFlagModeButton();
    
    isFirstClick = true; 
    updateFlags();
    
    // 配列とセル(div)の作成
    for(let y=0; y<HEIGHT; y++){
        cells[y]=[];
        for(let x=0; x<WIDTH; x++){
            const div = document.createElement("div");
            div.className = "cell";
            board.appendChild(div);

            cells[y][x] = {
                x,
                y,
                mine: false,
                open: false,
                flag: false,
                count: 0,
                div
            };

            // スマホ・PC両対応のクリックイベント（フラッグモード連動）
            div.onclick = () => {
                if (isFlagMode) {
                    toggleFlag(x, y);
                } else {
                    openCell(x, y);
                }
            };

            // 右クリックで旗を立てる（PC用）
            div.oncontextmenu = (e) => {
                e.preventDefault();
                toggleFlag(x, y);
            };

            // 長押しで旗を立てる（スマホ用サブ操作）
            let timer;
            div.ontouchstart = () => {
                timer = setTimeout(() => toggleFlag(x, y), 400);
            };
            div.ontouchend = () => clearTimeout(timer);
            div.ontouchmove = () => clearTimeout(timer);
        }
    }
}

// 初手クリックされた場所を避けて地雷を配置する関数
function generateMines(firstX, firstY) {
    let placed = 0;

    while (placed < MINES) {
        let x = Math.floor(Math.random() * WIDTH);
        let y = Math.floor(Math.random() * HEIGHT);

        // 初手クリックしたマスの周囲9マスならやり直し
        if (Math.abs(x - firstX) <= 1 && Math.abs(y - firstY) <= 1) {
            continue;
        }

        if (!cells[y][x].mine) {
            cells[y][x].mine = true;
            placed++;
        }
    }

    // 周囲の数字計算
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (cells[y][x].mine) continue;
            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    let nx = x + dx;
                    let ny = y + dy;
                    if (nx >= 0 && ny >= 0 && nx < WIDTH && ny < HEIGHT) {
                        if (cells[ny][nx].mine) count++;
                    }
                }
            }
            cells[y][x].count = count;
        }
    }
}

function toggleFlag(x,y){
    if(gameOver)return;
    const c=cells[y][x];
    if(c.open)return;

    c.flag=!c.flag;
    c.div.textContent=c.flag?"🎀":"";
    c.div.classList.toggle("flag");
    updateFlags(); 
}

function openCell(x,y){
    if(gameOver)return;
    const c=cells[y][x];
    if(c.open||c.flag)return;

    // 初手クリックなら、ここで安全地帯を作ってから爆弾を配置
    if (isFirstClick) {
        isFirstClick = false;
        generateMines(x, y);
    }

    c.open=true;
    c.div.classList.add("open");

    if(c.mine){
        c.div.textContent="💣";
        c.div.classList.add("mine");
        revealMines();
        message.textContent="💥 Game Over";
        gameOver=true;
        return;
    }

    if(c.count > 0){
        c.div.textContent=c.count;
        c.div.classList.add(`n${c.count}`);
    } else {
        // 周囲に爆弾がない（0の）場合、再帰的に開く
        for(let dy=-1; dy<=1; dy++){
            for(let dx=-1; dx<=1; dx++){
                let nx=x+dx;
                let ny=y+dy;
                if(nx>=0 && ny>=0 && nx<WIDTH && ny<HEIGHT){
                    if(!cells[ny][nx].open){
                        openCell(nx,ny);
                    }
                }
            }
        }
    }
    checkWin();
}

function revealMines(){
    for(let row of cells){
        for(let c of row){
            if(c.mine){
                c.div.textContent="💣";
                c.div.classList.add("mine");
            }
        }
    }
}

function checkWin(){
    let opened=0;
    for(let row of cells){
        for(let c of row){
            if(c.open)opened++;
        }
    }
    if(opened===WIDTH*HEIGHT-MINES){
        message.textContent="✨ Game Clear";
        gameOver=true;
        return;
    }
}

function updateFlags(){
    const used=cells.flat().filter(c=>c.flag).length;
    flags.textContent=`🎀 ${used}/${MINES}`;
}

// 最初のゲーム開始
init();