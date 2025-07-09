/**
 * <he-pilltag> – Custom Tag/Pill Web Component
 * --------------------------------------------
 * Author: Henrik Eriksson
 * Email:  archmiffo@gmail.com
 * 
 * A lightweight, customizable tag/pill element with editable text, removal option,
 * and optional auto-complete behavior. Intended for use in dynamic UIs for tagging,
 * searching, filtering or categorizing items.
 * 
 * Tags can be clicked, edited (via double click or script), or removed. The component
 * emits custom events to inform the outside system of actions taken.
 * 
 * Features:
 * - Display-only by default; optional editable and removable modes via attributes or JS.
 * - Auto-complete functionality with inline predictive text, activated during editing.
 * - Exposes several visual variables via CSS custom properties.
 * - Can be inserted declaratively in HTML or dynamically via JavaScript.
 * 
 * HTML Attributes:
 * - auto-complete:  JSON-stringified array of suggestions (e.g. '["Dog","Cat"]')
 * - editable:       If present, enables editing (default: false)
 * - removable:      If present, shows a remove (×) button (default: false)
 * 
 * JavaScript Properties:
 * - textContent:    Gets or sets the tag’s current label text
 * - editable:       Boolean; enables or disables inline editing
 * - removable:      Boolean; enables or disables removal UI
 * - autoComplete:   Array of strings used for prediction (case-insensitive)
 * 
 * CSS Custom Properties:               Default:
 * - --he-font-family                   "Oswald", sans-serif
 * - --he-font-size                     12px
 * - --he-color                         #333
 * - --he-remove-color                  #000
 * - --he-remove-button-color         #c0c0c0
 * - --he-remove-button-hover-color   #a0a0a0
 * - --he-placeholder-color             #777
 * - --he-bg                          #e0e0e0
 * - --he-edit-bg                       #fff
 * - --he-border-radius                 20px
 * 
 * Custom Events:
 * - he-tag-clicked:
 *     Fired when non-editable tag is clicked.
 *     detail: { tag: "ClickedText" }
 * 
 * - he-tag-removed:
 *     Fired when the tag is removed via × button.
 *     detail: { tag: "RemovedText" }
 * 
 * - he-tag-updated:
 *     Fired when an edited tag changes value.
 *     detail: { newTag: "UpdatedText", oldTag: "PreviousText" }
 * 
 * - he-tag-added:
 *     Fired when a new tag is confirmed from initial state.
 *     detail: { newTag: "AddedText" }
 * 
 * Example usage (HTML):
 * <he-pilltag editable removable auto-complete='["Apple","Apricot","Avocado"]'>Apple</he-pilltag>
 * 
 * Example usage (JavaScript):
 * const tag = document.createElement('he-pilltag');
 * tag.textContent = "Banana";
 * tag.editable = true;
 * tag.removable = true;
 * tag.autoComplete = ["Banana", "Blueberry", "Blackberry"];
 * tag.addEventListener('he-tag-updated', e => console.log(e.detail));
 * document.body.appendChild(tag);
 */
document.addEventListener('DOMContentLoaded', () => {
    class PillTag extends HTMLElement {
        
        static get observedAttributes() {
            return ['auto-complete', 'editable', 'removable'];
        }
        #wrapper
        #editable
        #removable
        #tagText
        #removeButton
        #autoCompleteLabel
        #autoComplete
        #originalText
        constructor() {
            super();
            const font = document.createElement("link");
            font.href = "https://fonts.googleapis.com/css?family=Oswald:wght@200&display=swap";
            font.rel = "stylesheet"
            document.head.appendChild(font);

            const rawText = Array.from(this.childNodes)
                .filter(n => n.nodeType === Node.TEXT_NODE)
                .map(n => n.textContent)
                .join('')
                .trim();

            const shadow = this.attachShadow({ mode: 'open' });
            const template = document.createElement('template');
            template.innerHTML = `
                <style>
                    :host {
                        --font-family: var(--he-font-family, "Oswald", sans-serif);
                        --font-size: var(--he-font-size, 12px);
                        --color: var(--he-color, #333);
                        --remove-color: var(--he-remove-color, #000);
                        --remove-button-color: var(--he-remove-button-color, #c0c0c0);
                        --remove-button-hover-color: var(--he-remove-button-hover-color, #a0a0a0);
                        --placeholder-color: var(--he-placeholder-color, #777);
                        --bg: var(--he-bg, #e0e0e0);
                        --edit-bg: var(--he-edit-bg, #fff);
                        --border-radius: var(--he-border-radius, 20px);
                    }

                    .pill-tag {
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        background-color: var(--bg);
                        border-radius: var(--border-radius);
                        padding-left: 1rem;
                        padding-right: 5px;
                        padding-top: 5px;
                        padding-bottom: 5px;
                        font-family: var(--font-family);
                        font-optical-sizing: auto;
                        font-weight: 200;
                        font-style: normal;
                        font-size: var(--font-size);
                        color: var(--color);
                    }

                    #tag-text {
                        display: flex;
                        justify-content: center;
                        font-size: var(--font-size);
                        color: var(--color);
                        margin-right: 0.5rem;
                        outline: none;
                        cursor: pointer;
                    }
                    
                    #tag-text[contenteditable="true"] {
                        justify-content: start;
                        outline: 1px solid var(--placeholder-color);
                        background-color: var(--edit-bg);
                        border-radius: var(--border-radius);
                        padding: 0 10px;
                        min-width: 100px;
                    }

                    #prediction {
                        color: #888;
                        font-size: var(--font-size);
                        white-space: pre;
                        font-style: italic;
                    }
                    
                    .remove-tag {
                        display: none;
                        background: var(--remove-button-color);
                        border: none;
                        color: var(--remove-color);
                        font-size: calc(var(--font-size) * 1.2);
                        cursor: pointer;
                        padding: 0 5px;
                        border-radius: 50%;
                    }

                    .remove-tag:hover {
                        background: var(--remove-button-hover-color);
                    }

                    #auto-complete-label {
                        position: absolute;
                        display: none;
                        font-size: var(--font-size);
                        color: var(--placeholder-color);
                        pointer-events: none;
                        left: 1.7rem;
                    }
                </style>
                <div>
                    <span class="pill-tag" tabindex="0" id="wrapper">
                        <span class="tag-text" contenteditable="false" id="tag-text" tabindex="0">
                            New Tag
                        </span>
                        <button class="remove-tag">&times;</button>
                        <label id="auto-complete-label" style="display: none;">Edit Tag...</label>
                    </span>
                </div>
                `;
            shadow.appendChild(template.content.cloneNode(true));

            this.#autoComplete = this.getAttribute('auto-complete') ? JSON.parse(this.getAttribute('auto-complete')) : [];
            this.#wrapper = shadow.querySelector('.pill-tag');
            this.#tagText = shadow.querySelector('.tag-text');
            this.#removeButton = shadow.querySelector('.remove-tag');
            this.#autoCompleteLabel = this.shadowRoot.getElementById('auto-complete-label');

            this.#tagText.textContent = rawText;
            this.#originalText = rawText;

            this.#removeButton.addEventListener('click', () => {
                this.remove();
                this.dispatchEvent(new CustomEvent('he-tag-removed', {
                    detail: { tag: this.#tagText.textContent.trim() }
                }));
            });

            this.#tagText.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.#editable) {
                    this.dispatchEvent(new CustomEvent('he-tag-clicked', {
                        detail: { tag: this.#tagText.textContent.trim() }
                    }));
                    return;
                }
            });

            this.#tagText.addEventListener('focus', () => {
                this.#openEdit();

                let justConfirmed = false;

                this.#tagText.addEventListener('blur', () => {
                    if (justConfirmed) {
                        return;
                    }
                    this.#abortEdit();
                });

                this.#tagText.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        justConfirmed = true;
                        this.#confirmEdit();
                        setTimeout(() => {justConfirmed = false;}, 0);
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        this.#abortEdit();
                    }
                    if (e.key === 'Tab') {
                        const prediction = this.shadowRoot.getElementById('prediction');
                        if (prediction) {
                            e.preventDefault();
                            this.#confirmPrediction();
                        }else{
                            justConfirmed = true;
                            this.#confirmEdit();
                            setTimeout(() => {justConfirmed = false;}, 0);
                        }
                    }
                });

                this.#tagText.addEventListener('input', (e) => {
                    this.#predictEdit();
                    e.target.textContent.length > 0 ? this.#autoCompleteLabel.style.display = 'none' : this.#autoCompleteLabel.style.display = 'block';
                });
            });

        }

        get autoComplete() {
            return this.#autoComplete;
        }
        set autoComplete(value) {
            if (Array.isArray(value)) {
                this.#autoComplete = value;
            } else {
                console.error('auto-complete must be an array');
            }
        }

        get editable() {
            return this.#editable;
        }
        set editable(value) {
            if (typeof value === 'boolean') {
                this.#editable = value;
            }
        }

        get removable() {
            return this.#removable;
        }
        set removable(value) {
            if (typeof value === 'boolean') {
                this.#removable = value;
                if (this.#removable) {
                    this.#removeButton.style.display = 'inline-block';
                } else {
                    this.#removeButton.style.display = 'none';
                }
            }
        }

        get textContent() {
            return this.#originalText;
        }
        set textContent(value) {
            if (typeof value === 'string') {
                this.#tagText.textContent = value.trim();
                this.#originalText = value.trim();
                this.addAutoComplete(this.#tagText.textContent.trim());
            } else {
                console.error('textContent must be a string');
            }
        }

        #openEdit() {
            if (!this.#editable) {
                return;
            }
            this.#tagText.setAttribute('contenteditable', 'true');
            this.#originalText = this.#tagText.textContent.trim();
            this.#tagText.focus();
            if(this.#tagText.textContent.trim() === 'New Tag') {
                this.#tagText.textContent = '';
            }
            if(this.#tagText.textContent.trim() === '') {
                this.#autoCompleteLabel.style.display = 'block';
            } else {
                this.#autoCompleteLabel.style.display = 'none';
                const selections = window.getSelection();
                if (selections.rangeCount > 0) {
                    selections.removeAllRanges();
                }

                const range = document.createRange();
                range.selectNodeContents(this.#tagText);
                selections.addRange(range);
            }
        }

        #confirmEdit() {
            if (this.#tagText.textContent.trim() !== '') {
                this.#tagText.textContent = this.#tagText.textContent.trim().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
                this.addAutoComplete(this.#tagText.textContent.trim());
            }else {
                this.#tagText.textContent = 'New Tag';
            }
            this.#tagText.setAttribute('contenteditable', 'false');
            if(this.#tagText.textContent.trim() !== this.#originalText && this.#originalText !== 'New Tag') {
                this.dispatchEvent(new CustomEvent('he-tag-updated', {
                    detail: { newTag: this.#tagText.textContent.trim(), oldTag: this.#originalText }
                }));
            }
            if (this.#originalText === 'New Tag') {
                this.dispatchEvent(new CustomEvent('he-tag-added', {
                    detail: { newTag: this.#tagText.textContent.trim() }
                }));
            }
            this.#originalText = this.#tagText.textContent.trim();
            this.#autoCompleteLabel.style.display = 'none';
            this.#tagText.blur();
        }

        #abortEdit() {
            if (this.#tagText.textContent.trim() !== '') {
                this.#tagText.textContent = this.#tagText.textContent.trim();
                this.addAutoComplete(this.#tagText.textContent.trim());
            } else {
                this.#tagText.textContent = 'New Tag';
            }
            this.#tagText.setAttribute('contenteditable', 'false');
            this.#tagText.textContent = this.#originalText;
            this.#autoCompleteLabel.style.display = 'none';
        }

        #predictEdit() {
            const clone = this.#tagText.cloneNode(true);
            const predictionInClone = clone.querySelector('#prediction');
            if (predictionInClone) {
                predictionInClone.remove();
            }
            const inputText = clone.textContent;

            let prediction = this.shadowRoot.getElementById('prediction');
            if (prediction) {
                prediction.remove();
            }
            if (this.#autoComplete.length > 0 && inputText.length > 0) {
                const filtered = this.#autoComplete.filter(item => item.toLowerCase().startsWith(inputText.toLowerCase().trim()));
                if (filtered.length > 0) {
                    let prediction = document.createElement('span');
                    prediction.id = 'prediction';
                    prediction.textContent = filtered.sort()[0].slice(inputText.length);
                    this.#tagText.appendChild(prediction);
                }
            }
        }

        #confirmPrediction() {
            const prediction = this.shadowRoot.getElementById('prediction');
            const inputText = this.shadowRoot.querySelector('#tag-text').childNodes[0].textContent;
            this.#tagText.textContent = inputText + prediction.textContent;
            prediction.remove();
            
            // Position caret at the end
            const range = document.createRange();
            const selection = window.getSelection();
            
            // Move to the end of the text content
            range.selectNodeContents(this.#tagText);
            range.collapse(false); // false = collapse to end
            
            selection.removeAllRanges();
            selection.addRange(range);
        }

        edit() {
            this.#openEdit();
        }

        addAutoComplete(value) {
            if (typeof value === 'string') {
                this.#autoComplete.push(value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}));
                const autoCompleteSet = new Set(this.#autoComplete);
                this.#autoComplete = Array.from(autoCompleteSet);
                this.setAttribute('auto-complete', JSON.stringify(this.#autoComplete));
            } else {
                console.error('Value must be a string');
            }
        }

        attributeChangedCallback(name, oldValue, newValue) {
            const propertyName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            if (newValue === null || newValue === undefined || newValue === '') {
                newValue = 'true';
            }
            if (propertyName in this) {
                this[propertyName] = JSON.parse(newValue);
            }
        }

        connectedCallback() {



            this.#editable = this.hasAttribute('editable');
            this.#removable = this.hasAttribute('removable');
        }

    }
    customElements.define('he-pilltag', PillTag);
});