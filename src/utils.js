export function displayDialogue(sentences, onDisplayEnd) {
    const dialogueUI = document.getElementById('dialogue-container');
    const dialogue = document.getElementById('dialogue');
    
    dialogueUI.style.display = 'block';
    
    let currentSentenceIndex = 0;
    let currentCharIndex = 0;
    let currentText = '';
    let interval;
    let isTyping = false;
    let allSentencesShown = false;

    const handleSpace = (e) => {
        if (e.code !== 'Space') return;
        

        if (isTyping) {
            clearInterval(interval);
            currentText = sentences[currentSentenceIndex];
            dialogue.innerHTML = currentText + '<br/><span style="opacity:0.5">[Press Space]</span>';
            isTyping = false;
            return;
        }
        

        currentSentenceIndex++;
        if (currentSentenceIndex < sentences.length) {
            startTyping();
        } else {
            finishDialogue();
        }
    };

    const startTyping = () => {
        currentCharIndex = 0;
        currentText = '';
        isTyping = true;
        dialogue.innerHTML = '';
        
        interval = setInterval(() => {
            if (currentCharIndex < sentences[currentSentenceIndex].length) {
                currentText += sentences[currentSentenceIndex][currentCharIndex];
                dialogue.innerHTML = currentText;
                currentCharIndex++;
                return;
            } else {
                clearInterval(interval);
                dialogue.innerHTML += '<br/><span style="opacity:0.5">[Press Space]</span>';
                isTyping = false;
            }
        }, 10);
    };

    const finishDialogue = () => {
        clearInterval(interval);
        onDisplayEnd();
        dialogueUI.style.display = 'none';
        dialogue.innerHTML = '';
        window.removeEventListener('keydown', handleSpace);
        allSentencesShown = true;
    };

    window.addEventListener('keydown', handleSpace);
    startTyping();
}

export function displayHint(hintText, isVisible) {
    const hintUI = document.getElementById('hint-container');
    const hint = document.getElementById('hint');
    hintUI.style.display = isVisible ? 'block' : 'none';
    if (isVisible) {
        hint.innerHTML = hintText;
    } else {
        hint.innerHTML = '';
    }
}