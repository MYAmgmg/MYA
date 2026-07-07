// ハートを浮かせる病みかわ演出
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
    const duration = Math.random()*15 + 10;
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
for(let i=0;i<20;i++){
    createHeart();
}

