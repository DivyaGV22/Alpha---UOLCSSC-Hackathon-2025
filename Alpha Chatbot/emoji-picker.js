// Emoji Picker System
// Provides emoji selection functionality
//This part of code we used CHATGPT to make help generate the emojis we can use

class EmojiPicker {
    constructor() {
        this.emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
            '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
            '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
            '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
            '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
            '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎',
            '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
            '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
            '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
            '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
            '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
            '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗',
            '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚',
            '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦',
            '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋',
            '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
            '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
            '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
            '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
            '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸',
            '🥗', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒',
            '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
            '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖',
            '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭',
            '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫',
            '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙',
            '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦',
            '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩',
            '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕️', '🍵', '🧃', '🥤',
            '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
            '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂'
        ];
        this.picker = null;
        this.isOpen = false;
    }

    init() {
        this.picker = document.getElementById('emojiPicker');
        this.populateEmojis();
        this.setupEventListeners();
    }

    populateEmojis() {
        const grid = document.getElementById('emojiGrid');
        if (!grid) {
            console.warn('Emoji grid not found');
            return;
        }

        // Clear existing emojis to prevent duplicates
        grid.innerHTML = '';

        this.emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'emoji-item';
            emojiBtn.type = 'button'; // Prevent form submission
            emojiBtn.textContent = emoji;
            emojiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectEmoji(emoji);
            });
            grid.appendChild(emojiBtn);
        });
    }

    setupEventListeners() {
        // Don't add emoji button handler here - it's handled in chatbot.js
        // This prevents duplicate event listeners
        const closeBtn = document.getElementById('closeEmojiPicker');

        if (closeBtn) {
            // Remove existing listener if any
            if (this._closeHandler) {
                closeBtn.removeEventListener('click', this._closeHandler);
            }
            
            this._closeHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            };
            closeBtn.addEventListener('click', this._closeHandler);
        }

        // Close when clicking outside
        if (this._outsideClickHandler) {
            document.removeEventListener('click', this._outsideClickHandler);
        }
        
        this._outsideClickHandler = (e) => {
            const emojiBtn = document.getElementById('emojiBtn');
            if (this.isOpen && this.picker && !this.picker.contains(e.target)) {
                // Don't close if clicking the emoji button
                if (e.target !== emojiBtn && !emojiBtn?.contains(e.target)) {
                    this.close();
                }
            }
        };
        document.addEventListener('click', this._outsideClickHandler);
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.picker) {
            this.picker.classList.add('show');
            this.isOpen = true;
            console.log('Emoji picker opened');
        } else {
            console.error('Picker element not found');
        }
    }

    close() {
        if (this.picker) {
            this.picker.classList.remove('show');
            this.isOpen = false;
            console.log('Emoji picker closed');
        }
    }

    selectEmoji(emoji) {
        const userInput = document.getElementById('userInput');
        if (userInput && !userInput.disabled) {
            const cursorPos = userInput.selectionStart || userInput.value.length;
            const textBefore = userInput.value.substring(0, cursorPos);
            const textAfter = userInput.value.substring(cursorPos);
            userInput.value = textBefore + emoji + textAfter;
            
            // Trigger input event
            const inputEvent = new Event('input', { bubbles: true });
            userInput.dispatchEvent(inputEvent);
            
            userInput.focus();
            // Set cursor position after emoji
            setTimeout(() => {
                try {
                    const newPos = cursorPos + emoji.length;
                    userInput.setSelectionRange(newPos, newPos);
                } catch (e) {
                    // Ignore if selection range can't be set
                }
            }, 0);
        }
        this.close();
    }
}

// Initialize emoji picker when DOM is ready
if (typeof document !== 'undefined') {
    const initEmojiPicker = () => {
        // Only initialize if not already initialized and is an EmojiPicker instance
        if (!window.emojiPicker || !(window.emojiPicker instanceof EmojiPicker)) {
            try {
                window.emojiPicker = new EmojiPicker();
                window.emojiPicker.init();
                console.log('Emoji picker initialized successfully');
            } catch (error) {
                console.error('Error initializing emoji picker:', error);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initEmojiPicker, 200);
        });
    } else {
        // DOM already loaded
        setTimeout(initEmojiPicker, 200);
    }
}

