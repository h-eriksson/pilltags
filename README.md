# <he-pilltag> – Custom Web Component

A lightweight, customizable HTML tag/pill component with inline editing, optional removal, and auto-complete support. Built as a native Web Component with no dependencies.

---

## ✨ Features

- ✅ Editable tag text with keyboard controls (Enter, Tab, Escape)
- ❌ Optional remove (×) button
- 🔍 Inline auto-complete prediction based on a suggestion list
- 🎨 Fully styleable via CSS custom properties
- 📦 No dependencies, no build tools, no frameworks
- 🔌 Easy integration with HTML or JavaScript

---

## 🔧 Usage

### HTML Example

```html
<he-pilltag editable removable auto-complete='["Apple", "Apricot", "Avocado"]'>Apple</he-pilltag>
```
#### JavaScript Example
```javascript
const tag = document.createElement('he-pilltag');
tag.textContent = "Banana";
tag.editable = true;
tag.removable = true;
tag.autoComplete = ["Banana", "Blueberry", "Blackberry"];
document.body.appendChild(tag);
```

## 🎯 Events
|Event Name|Trigger|Detail Payload|
|---|---|---|
|`he-tag-clicked`|Click on non-editable tag|`{ tag: "ClickedText" }`|
|`he-tag-removed`|When × is clicked|`{ tag: "RemovedText" }`|
|`he-tag-updated`|When edited tag is confirmed|`{ newTag: "UpdatedText", oldTag: "Previous" }`|
|`he-tag-added`|When a new tag is confirmed|`{ newTag: "AddedText" }`|

## 🧠 Attributes
|Attribute|Type|Description|
|---|---|---|
|`editable`|Boolean|If present, enables inline editing|
|`removable`|Boolean|If present, shows × button for removal|
|`auto-complete`|String|JSON stringified array of suggestions|

## 🛠 Properties (JS)
|Property|Type|Description|
|---|---|---|
|`textContent`|String|Gets or sets tag label|
|`editable`|Boolean|Enables or disables editing|
|`removable`|Boolean|Enables or disables the remove button|
|`autoComplete`|Array|List of suggestions for auto-complete|

## 🎨 CSS Custom Properties
|Variable Name|Default|Description|
|---|---|---|
|`--he-font-family`|"Oswald", sans-serif|Font family
|`--he-font-size`|12px|Base font size|
|`--he-color`|#333|Tag text color|
|`--he-bg`|#e0e0e0|Background color|
|`--he-edit-bg`|#fff|Background while editing|
|`--he-remove-color`|#000|Remove button × color|
|`--he-remove-button-color`|#c0c0c0|Remove button background|
|`--he-remove-button-hover-color`|#a0a0a0|Hover state for remove button|
|`--he-placeholder-color`|#777|Hint text / prediction color|
|`--he-border-radius`|20px|Pill roundness|

## 💡 Notes
The initial label is set via the element's inner text.

`textContent` is internally normalized (capitalized words).

Prediction appears inline during editing and is confirmed with Tab.

## 📜 License
MIT License – do whatever you want, just don’t claim you wrote it.

## 👤 Author
Henrik Eriksson
archmiffo@gmail.com
