let SIZE = 20;
let MINES = 99;

const board = document.getElementById("board");
const restart = document.getElementById("restart");
const message = document.getElementById("message");
const flags = document.getElementById("flags");
document.querySelectorAll("#difficulty button").forEach(btn => {
    btn.onclick = () => {
        SIZE = Number(btn.dataset.size);
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
    board.style.setProperty("--size", SIZE);
    cells=[];
    gameOver=false;
    updateFlags();
    // 配列作成
    for(let y=0;y<SIZE;y++){
        cells[y]=[];

        for(let x=0;x<SIZE;x++){

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

        let x=Math.floor(Math.random()*SIZE);
        let y=Math.floor(Math.random()*SIZE);

        if(!cells[y][x].mine){
            cells[y][x].mine=true;
            placed++;
        }
    }

    // 数字計算
    for(let y=0;y<SIZE;y++){
        for(let x=0;x<SIZE;x++){

            if(cells[y][x].mine)continue;

            let count=0;

            for(let dy=-1;dy<=1;dy++){
                for(let dx=-1;dx<=1;dx++){

                    if(dx===0&&dy===0)continue;

                    let nx=x+dx;
                    let ny=y+dy;

                    if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE){

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

                if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE){

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

    if(opened===SIZE*SIZE-MINES){

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