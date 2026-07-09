let clickCount = 0;

        const messages = [
        `あ、れ……？どこをさがしても、<br>
        あなたのページがみつからないの。<br>
        <span style="color:#ff6699;">ねえ、わたしから逃げちゃったの……？</span><br>
        おねがいだから、ひとりにしないで。`,

        `ちょっとだけ落ち着いたかも…。<br>
        でも、まだ、みたされないの。`,

        `……まだここにいる？<br>
        ちゃんと見えてるよね。`,

        `帰ろうとしてる？<br>
        …まだ一緒にいてくれる？`,

        `ねぇ。<br>
        わたしだけおいてかないで。`,

        `……`,

        `<span style="color: red;">……あなたもわたしのこと<br>
        おいていくんだね。<span>`
        ];
        


        function takeMedicine() {
            const card = document.getElementById('mainCard');
            
            // 画面（カード）を揺らす演出
            card.classList.remove('shake-effect');
            void card.offsetWidth; // リフローを起こしてアニメーションをリセット
            card.classList.add('shake-effect');

            if(clickCount < messages.length)
                clickCount++;
            else
                clickCount = 0;

            const message = document.getElementById("errorMessage");

            if(clickCount < messages.length){
                message.innerHTML = messages[clickCount];
            }else{
                message.innerHTML = messages[messages.length - 1];
            }

            // 大量のお薬を降らせる
            const colors = ['#ff6699', '#cda4de', '#ffb7d5', '#ffffff'];
            for (let i = 0; i < 24; i++) {
                setTimeout(() => {
                    createMedicineRain(colors);
                }, i * 60); // 連続して小出しに降らせる
            }
        }

        function createMedicineRain(colors) {
            const med = document.createElement('div');
            med.classList.add('falling-med');
            
            // カプセルか錠剤かをランダム決定
            const isCapsule = Math.random() > 0.5;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            if (isCapsule) {
                // カプセル生成
                med.style.width = '44px';
                med.style.height = '20px';
                med.style.borderRadius = '10px';
                med.style.background = `linear-gradient(to right, ${randomColor} 50%, #ffffff 50%)`;
            } else {
                // 錠剤生成
                med.style.width = '26px';
                med.style.height = '26px';
                med.style.borderRadius = '50%';
                med.style.background = '#ffffff';
                med.style.border = `2px solid ${randomColor}`;
            }

            // 出現位置・速度のランダム化
            med.style.left = Math.random() * 100 + 'vw';
            med.style.top = '-40px';
            
            const duration = Math.random() * 1.5 + 1.5; // 1.5秒〜3.0秒で落下
            med.style.animationDuration = duration + 's';

            document.body.appendChild(med);

            // 画面外に消えたら要素を削除
            setTimeout(() => {
                med.remove();
            }, duration * 1000);
        }