
// --- 状態管理クラス ---
class SudokuGame {
constructor() {
this.board = Array(9).fill().map(() => Array(9).fill(0)); // 現在の盤面
this.initialBoard = Array(9).fill().map(() => Array(9).fill(0)); // 初期問題
this.solution = Array(9).fill().map(() => Array(9).fill(0)); // 正解盤面
this.notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set())); // メモデータ

this.selectedCell = null; // {r, c}
this.isNoteMode = false;
this.checkMode = false;

this.undoStack = [];
this.redoStack = [];
}

// 状態保存（Undo/Redo用）
saveState() {
const state = {
board: this.board.map(row => [...row]),
notes: this.notes.map(row => row.map(set => new Set(set)))
};
this.undoStack.push(state);
this.redoStack = []; // 新しい操作があったらRedoをクリア
}

undo() {
if (this.undoStack.length === 0) return;
const currentState = {
board: this.board.map(row => [...row]),
notes: this.notes.map(row => row.map(set => new Set(set)))
};
this.redoStack.push(currentState);

const prevState = this.undoStack.pop();
this.board = prevState.board;
this.notes = prevState.notes;
renderBoard();
}

redo() {
if (this.redoStack.length === 0) return;
const currentState = {
board: this.board.map(row => [...row]),
notes: this.notes.map(row => row.map(set => new Set(set)))
};
this.undoStack.push(currentState);

const nextState = this.redoStack.pop();
this.board = nextState.board;
this.notes = nextState.notes;
renderBoard();
}
}

const game = new SudokuGame();

// --- アルゴリズム部（生成・バックトラック・唯一解保証） ---

// ルールチェック判定
function isValid(board, r, c, val) {
for (let i = 0; i < 9; i++) {
if (board[r][i] === val && i !== c) return false;
if (board[i][c] === val && i !== r) return false;
const boxR = 3 * Math.floor(r / 3) + Math.floor(i / 3);
const boxC = 3 * Math.floor(c / 3) + i % 3;
if (board[boxR][boxC] === val && (boxR !== r || boxC !== c)) return false;
}
return true;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function findEmpty(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                return [r, c];
            }
        }
    }
    return null;
}

// バックトラックで盤面を満たす（シャッフル付き）
function fillBoard(board) {

    const empty = findEmpty(board);

    if (!empty) return true;

    const [r, c] = empty;

    const nums = shuffle([1,2,3,4,5,6,7,8,9]);

    for (const num of nums) {

        if (isValid(board, r, c, num)) {

            board[r][c] = num;

            if (fillBoard(board)) {
                return true;
            }

            board[r][c] = 0;
        }
    }

    return false;
}

// 解の個数をカウントする（唯一解確認用）
function countSolutions(board, limit = 2) {
let count = 0;

function solve(b) {
if (count >= limit) return;
for (let r = 0; r < 9; r++) {
for (let c = 0; c < 9; c++) {
if (b[r][c] === 0) {
for (let num = 1; num <= 9; num++) {
if (isValid(b, r, c, num)) {
b[r][c] = num;
solve(b);
b[r][c] = 0;
}
}
return;
}
}
}
count++;
}

solve(board);
return count;
}

// 問題生成メインルーチン
function generatePuzzle(difficulty) {
document.getElementById('loading').style.display = 'flex';

setTimeout(() => {
// 1. 完全盤面作成
const baseBoard = Array(9).fill().map(() => Array(9).fill(0));
fillBoard(baseBoard);
game.solution = baseBoard.map(row => [...row]);

// 2. 難易度に応じた穴あけ数設定
let holes = 30;
if (difficulty === 'medium') holes = 40;
if (difficulty === 'hard') holes = 50;

const puzzle = baseBoard.map(row => [...row]);
const cells = [];

for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
        cells.push([r, c]);
    }
}

// ランダムな順番にする
shuffle(cells);

let removed = 0;

for (const [r, c] of cells) {

    if (removed >= holes) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    const copy = puzzle.map(row => [...row]);

    if (countSolutions(copy) === 1) {
        removed++;
    } else {
        puzzle[r][c] = backup;
    }
}

game.initialBoard = puzzle.map(row => [...row]);
game.board = puzzle.map(row => [...row]);
game.notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
game.undoStack = [];
game.redoStack = [];
game.selectedCell = null;
game.checkMode = false;

renderBoard();
document.getElementById('loading').style.display = 'none';
}, 50);
}

// --- UI レンダリング部 ---
const boardEl = document.getElementById('board');

function createBoardDom() {
boardEl.innerHTML = '';
for (let r = 0; r < 9; r++) {
for (let c = 0; c < 9; c++) {
const cell = document.createElement('div');
cell.classList.add('cell');
cell.dataset.row = r;
cell.dataset.col = c;

// タップ・クリックイベント
cell.addEventListener('click', () => selectCell(r, c));
boardEl.appendChild(cell);
}
}
}

function renderBoard() {
const cells = boardEl.children;
const sel = game.selectedCell;
const targetNum = sel ? game.board[sel.r][sel.c] : 0;

for (let i = 0; i < 81; i++) {
const r = Math.floor(i / 9);
const c = i % 9;
const cell = cells[i];
const val = game.board[r][c];
const isInitial = game.initialBoard[r][c] !== 0;

// クラスの初期化
cell.className = 'cell';
cell.innerHTML = '';

// 初期値かユーザー入力値か
if (isInitial) {
cell.classList.add('initial');
cell.textContent = val;
} else if (val !== 0) {
cell.classList.add('input');
cell.textContent = val;
// 間違いチェックモード時
if (game.checkMode && val !== game.solution[r][c]) {
cell.classList.add('error');
}
} else {
// メモの表示
const cellNotes = game.notes[r][c];
if (cellNotes.size > 0) {
const noteGrid = document.createElement('div');
noteGrid.classList.add('note-grid');
for (let n = 1; n <= 9; n++) {
const noteNum = document.createElement('div');
noteNum.classList.add('note-num');
if (cellNotes.has(n)) noteNum.textContent = n;
noteGrid.appendChild(noteNum);
}
cell.appendChild(noteGrid);
}
}

// ハイライトロジック
if (sel) {
const isSameBox = Math.floor(r/3) === Math.floor(sel.r/3) && Math.floor(c/3) === Math.floor(sel.c/3);
if (r === sel.r && c === sel.c) {
cell.classList.add('selected');
} else if (r === sel.r || c === sel.c || isSameBox) {
cell.classList.add('hl-group');
}

if (targetNum !== 0 && val === targetNum) {
cell.classList.add('hl-same');
}
}
}
}

function selectCell(r, c) {
game.selectedCell = {r, c};
renderBoard();
}

// --- 入力・ゲームアクション処理 ---
function handleInput(num) {
if (!game.selectedCell) return;
const {r, c} = game.selectedCell;

// 初期マスは変更不可
if (game.initialBoard[r][c] !== 0) return;

game.saveState();

if (game.isNoteMode) {
if (num === 0) {
game.notes[r][c].clear();
} else {
game.board[r][c] = 0; // メモを書く時は数値を消す
if (game.notes[r][c].has(num)) {
game.notes[r][c].delete(num);
} else {
game.notes[r][c].add(num);
}
}
} else {
game.board[r][c] = num;
game.notes[r][c].clear(); // 数字を入れたらそのマスのメモは消す
}

renderBoard();
checkGameCompletion();
}

function checkGameCompletion() {
for(let r=0; r<9; r++) {
for(let c=0; c<9; c++) {
if(game.board[r][c] !== game.solution[r][c]) return; // 1マスでも違えば未完成
}
}
setTimeout(() => alert('🎉 おめでとうございます！完全クリアです！'), 200);
}

// --- イベントリスナー設定 ---

// テンキー入力
document.querySelectorAll('.num-btn').forEach(btn => {
btn.addEventListener('click', () => {
handleInput(parseInt(btn.textContent));
});
});

// 消去ボタン
document.getElementById('key-delete').addEventListener('click', () => handleInput(0));

// メモ切り替え
const noteBtn = document.getElementById('key-note');
noteBtn.addEventListener('click', () => {
game.isNoteMode = !game.isNoteMode;
noteBtn.classList.toggle('active', game.isNoteMode);
});

// 新しい問題ボタン
document.getElementById('btn-new').addEventListener('click', () => {
const diff = document.getElementById('difficulty').value;
generatePuzzle(diff);
});

// Undo / Redo
document.getElementById('btn-undo').addEventListener('click', () => game.undo());
document.getElementById('btn-redo').addEventListener('click', () => game.redo());

// リセットボタン
document.getElementById('btn-reset').addEventListener('click', () => {
if (confirm('この盤面を最初からやり直しますか？')) {
game.saveState();
game.board = game.initialBoard.map(row => [...row]);
game.notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
game.checkMode = false;
renderBoard();
}
});

// チェックボタン
document.getElementById('btn-check').addEventListener('click', () => {
game.checkMode = !game.checkMode;
document.getElementById('btn-check').classList.toggle('active', game.checkMode);
renderBoard();
});

// ヒントボタン
document.getElementById('btn-hint').addEventListener('click', () => {
if (!game.selectedCell) {
alert('ヒントを入れたいマスを選択してください。');
return;
}
const {r, c} = game.selectedCell;
if (game.initialBoard[r][c] !== 0) return;

game.saveState();
game.board[r][c] = game.solution[r][c];
game.notes[r][c].clear();
renderBoard();
checkGameCompletion();
});

// PC用キーボード対応
window.addEventListener('keydown', (e) => {
if (!game.selectedCell) return;

// 矢印キーでの選択移動
let {r, c} = game.selectedCell;
if (e.key === 'ArrowUp') { r = Math.max(0, r - 1); selectCell(r, c); e.preventDefault(); }
if (e.key === 'ArrowDown') { r = Math.min(8, r + 1); selectCell(r, c); e.preventDefault(); }
if (e.key === 'ArrowLeft') { c = Math.max(0, c - 1); selectCell(r, c); e.preventDefault(); }
if (e.key === 'ArrowRight') { c = Math.min(8, c + 1); selectCell(r, c); e.preventDefault(); }

// 数字入力 (1-9)
if (e.key >= '1' && e.key <= '9') {
handleInput(parseInt(e.key));
}
// 消去 (Backspace, Delete, 0)
if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
handleInput(0);
}
// メモモード切り替え用ショートカット (「n」キー)
if (e.key.toLowerCase() === 'n') {
game.isNoteMode = !game.isNoteMode;
noteBtn.classList.toggle('active', game.isNoteMode);
}
});

// アプリ初期化実行
createBoardDom();
generatePuzzle('medium');


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
for(let i=0;i<40;i++){
    createHeart();
}