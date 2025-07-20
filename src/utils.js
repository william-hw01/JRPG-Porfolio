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

export function playerMovement(scene, player, cursor, playerSpeed, multiplier = 1) {
    player.setVelocity(0);
    // Use scene.input.keyboard to check WASD keys globally
    const keyboard = scene.input.keyboard;
    const A = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const D = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const W = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const S = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    if (cursor.left.isDown || A.isDown) {
        if (player.anims.currentAnim?.key !== 'left_walk') {
            player.anims.play('left_walk', true);
        }
        player.setVelocityX(-playerSpeed * multiplier);
    } else if (cursor.right.isDown || D.isDown) {
        if (player.anims.currentAnim?.key !== 'right_walk') {
            player.anims.play('right_walk', true);
        }
        player.setVelocityX(playerSpeed * multiplier);
    } else if (cursor.up.isDown || W.isDown) {
        if (player.anims.currentAnim?.key !== 'back_walk') {
            player.anims.play('back_walk', true);
        }
        player.setVelocityY(-playerSpeed * multiplier);
    } else if (cursor.down.isDown || S.isDown) {
        if (player.anims.currentAnim?.key !== 'front_walk') {
            player.anims.play('front_walk', true);
        }
        player.setVelocityY(playerSpeed * multiplier);
    } else {
        player.anims.stop();
        player.setTexture('protagonist_64x64');
    }
}