
export const removeLibraryTrigger = () => {
    const trigger = document.querySelector('.default-sidebar-trigger');
    trigger?.remove();
}

export const addMathButton = () => {
    setTimeout(() => {
        // if the math button exist, if it does, don't add it again
        if (document.getElementById("math-trigger-button")) return;
        const target = document.querySelector(".Island.dropdown-menu-container");
        if (!target) return;
        const button = document.createElement("button");
        button.id = "math-trigger-button";
        button.className = "dropdown-menu-item dropdown-menu-item-base";
        button.innerHTML = "Math";
        button.onclick = () => {
            console.log("math button clicked")
        }
        target.appendChild(button);
    })
}