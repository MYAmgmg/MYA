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
for(let i=0;i<40;i++){
    createHeart();
}

let WIDTH = 16;
let HEIGHT = 25;
let MINES = 99;

const board = document.getElementById("board");
const restart = document.getElementById("restart");
const message = document.getElementById("message");
const flags = document.getElementById("flags");
document.querySelectorAll("#difficulty button").forEach(btn => {
    btn.onclick = () => {
        const size = Number(btn.dataset.size);
        
        WIDTH = size;
        // data-height属性があればそれを使い、無ければ width（size）と同じにする
        HEIGHT = btn.dataset.height ? Number(btn.dataset.height) : size;
        MINES = Number(btn.dataset.mines);
        
        init();
    };
});

let cells = [];
let gameOver = false;

restart.onclick = init;

function init(){

    message.textContent = "";
    board.innerHTML="";
    board.style.setProperty("--width", WIDTH);
    board.style.setProperty("--height", HEIGHT);
    cells=[];
    gameOver=false;
    updateFlags();
    // 配列作成
    for(let y=0;y<HEIGHT;y++){
        cells[y]=[];

        for(let x=0;x<WIDTH;x++){

            const div=document.createElement("div");
            div.className="cell";

            board.appendChild(div);

            cells[y][x]={
                x,
                y,
                mine:false,
                open:false,
                flag:false,
                count:0,
                div
            };

            div.onclick=()=>openCell(x,y);

            div.oncontextmenu=(e)=>{
                e.preventDefault();
                toggleFlag(x,y);
                
            };
            let timer;

            div.ontouchstart = () => {
                timer = setTimeout(() => toggleFlag(x,y), 400);
            };

            div.ontouchend = () => clearTimeout(timer);
            div.ontouchmove = () => clearTimeout(timer);
        }
    }

    // 地雷配置
    let placed=0;

    while(placed<MINES){

        let x=Math.floor(Math.random()*WIDTH);
        let y=Math.floor(Math.random()*HEIGHT);

        if(!cells[y][x].mine){
            cells[y][x].mine=true;
            placed++;
        }
    }

    // 数字計算
    for(let y=0;y<HEIGHT;y++){
        for(let x=0;x<WIDTH;x++){

            if(cells[y][x].mine)continue;

            let count=0;

            for(let dy=-1;dy<=1;dy++){
                for(let dx=-1;dx<=1;dx++){

                    if(dx===0&&dy===0)continue;

                    let nx=x+dx;
                    let ny=y+dy;

                    if(nx>=0&&ny>=0&&nx<WIDTH&&ny<HEIGHT){

                        if(cells[ny][nx].mine)count++;

                    }
                }
            }

            cells[y][x].count=count;
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

    if(c.count>0){

        c.div.textContent=c.count;
        c.div.classList.add(`n${c.count}`);

    }else{

        for(let dy=-1;dy<=1;dy++){
            for(let dx=-1;dx<=1;dx++){

                let nx=x+dx;
                let ny=y+dy;

                if(nx>=0&&ny>=0&&nx<WIDTH&&ny<HEIGHT){

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

init();
