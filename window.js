function convertDiv2Window(target){
    if(!target) { return; }
    function createButton(className, events) {
        const button = document.createElement("button");
        button.classList.add(className);
        button.addEventListener("mousedown", function(e){button.classList.add("active");});
        button.addEventListener("mouseup", function(e){button.classList.remove("active");});
        button.addEventListener("touchstart", function(e){button.classList.add("active");});
        button.addEventListener("touchend", function(e){button.classList.remove("active");});
        button.addEventListener("mouseleave", function(e){button.classList.remove("active");});
        events.forEach(function(event){
            button.addEventListener(event.name, event.callback);
        });
        return button;
    }

    let offsetX, offsetY;
    let mouseX, mouseY;
    let origin_width, origin_height, origin_top, origin_bottom, origin_left, origin_right;
    function createHandle(target, className, stateName, onMouseDown, onMouseMove, onMouseUp) {
        const handle = document.createElement("div");
        handle.classList.add(className);
    
        const startEvent = function(e){
            e.preventDefault();
            target.classList.add(className + "-active");
            target.classList.add(stateName);

            const rect = target.getBoundingClientRect();
            const style = window.getComputedStyle(target);
            const minusRight = (parseFloat(style.paddingRight) * 2) + (parseFloat(style.marginRight) * 2) + (parseFloat(style.borderRight) * 2);
            const minusBottom = (parseFloat(style.paddingBottom) * 2) + (parseFloat(style.marginBottom) * 2) + (parseFloat(style.borderBottom) * 2);

            mouseX = e.touches ? e.touches[0].clientX : e.clientX;
            mouseY = e.touches ? e.touches[0].clientY : e.clientY;
            origin_width = rect.width;
            origin_height = rect.height;
            origin_left = rect.left;
            origin_right = rect.left + origin_width - minusRight;
            origin_top = rect.top;
            origin_bottom = rect.top + origin_height - minusBottom;
            offsetX = mouseX - rect.left;
            offsetY = mouseY - rect.top;

            document.body.style.userSelect = "none";
            onMouseDown(e);
        };
        const moveEvent = function(e){
            e.preventDefault();
            if (!target.classList.contains(className + "-active")) return;
            if (target.classList.contains("maximize")) return;
            onMouseMove(e);
        };
        const endEvent = function(e){
            if (target.classList.contains(className + "-active")) {
                target.classList.remove(className + "-active");
                target.classList.remove(stateName);
                document.body.style.userSelect = "";
                onMouseUp(e);
            }
        };

        handle.addEventListener("mousedown", startEvent);
        document.addEventListener("mousemove", moveEvent);
        document.addEventListener("mouseup", endEvent);

        handle.addEventListener("touchstart", startEvent, { passive: false });
        document.addEventListener("touchmove", moveEvent, { passive: false });
        document.addEventListener("touchend", endEvent);

        return handle;
    }
    
    let handle = createHandle(target, "handle", "drag",
        function(e){ },
        function(e){
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            target.style.setProperty('--left', (clientX - offsetX) + "px");
            target.style.setProperty('--top', (clientY - offsetY) + "px");
        },
        function(e){}
    );
    target.appendChild(handle);

    const directions = [
        { className: "handle-top", stateName: "resize", activeClasses: [], mousedown: function(e){}, mousemove: function(e){
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const newHeight = origin_height + (mouseY - clientY);
            target.style.setProperty('--height', newHeight + "px");
            target.style.setProperty('--top', (origin_bottom > (clientY - offsetY) ? (clientY - offsetY) : origin_bottom) + "px");
        }, mouseup: function(e){}},
        { className: "handle-bottom", stateName: "resize", activeClasses: [], mousedown: function(e){}, mousemove: function(e){
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const newHeight = origin_height + (clientY - mouseY);
            target.style.setProperty('--height', newHeight + "px");
            target.style.setProperty('--top', origin_top + "px");
        }, mouseup: function(e){}},
        { className: "handle-left", stateName: "resize", activeClasses: [], mousedown: function(e){}, mousemove: function(e){
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const newWidth = origin_width + (mouseX - clientX);
            target.style.setProperty('--width', newWidth + "px");
            target.style.setProperty('--left', (origin_right > (clientX - offsetX) ? (clientX - offsetX) : origin_right) + "px");
        }, mouseup: function(e){}},
        { className: "handle-right", stateName: "resize", activeClasses: [], mousedown: function(e){}, mousemove: function(e){
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const newWidth = origin_width + (clientX - mouseX);
            target.style.setProperty('--width', newWidth + "px");
            target.style.setProperty('--left', origin_left + "px");
        }, mouseup: function(e){}},
        { className: "handle-nw", stateName: "resize", activeClasses: ["handle-top-active", "handle-left-active"], mousedown: function(e){}, mousemove: function(e){}, mouseup: function(e){}},
        { className: "handle-ne", stateName: "resize", activeClasses: ["handle-top-active", "handle-right-active"], mousedown: function(e){}, mousemove: function(e){}, mouseup: function(e){}},
        { className: "handle-sw", stateName: "resize", activeClasses: ["handle-bottom-active", "handle-left-active"], mousedown: function(e){}, mousemove: function(e){}, mouseup: function(e){}},
        { className: "handle-se", stateName: "resize", activeClasses: ["handle-bottom-active", "handle-right-active"], mousedown: function(e){}, mousemove: function(e){}, mouseup: function(e){}},
    ];
    directions.forEach(function(direction){
        var className = direction.className, activeClasses = direction.activeClasses, stateName = direction.stateName;
        var mousedown = direction.mousedown, mousemove = direction.mousemove, mouseup = direction.mouseup;
        const handle = createHandle(target, className, stateName,
            function(e){ 
                activeClasses.forEach(function(cls){ target.classList.add(cls); });
                mousedown(e);
            },
            function(e){ mousemove(e); },
            function(e){ 
                activeClasses.forEach(function(cls){ target.classList.remove(cls); });
                mouseup(e);
            }
        );
        target.appendChild(handle);
    });

    let close_btn;
    target.appendChild(
        close_btn = createButton("close-btn", [
            {name:"click", callback: function(){ target.remove(); }}
        ])
    );

    let size_btn = document.createElement("button");
    target.appendChild(
        size_btn = createButton("size-btn", [{name:"click", callback: function(){ target.classList.toggle("maximize"); }}])
    );

    let hide_btn = document.createElement("button");
    target.appendChild(
        hide_btn = createButton("hide-btn", [{name:"click", callback: function(){ target.classList.add("hide"); }}])
    );

    return {origin : target, close : close_btn, size : size_btn};
}

function createWindow(width, height, left, top, replace_id){
    let div = document.createElement("div");
    div.classList.add("window");
    div.style.setProperty('--width', width);
    div.style.setProperty('--height', height);
    div.style.setProperty('--left', left);
    div.style.setProperty('--top', top);
    
    convertDiv2Window(div);
    if(replace_id){
        let replace = document.getElementById(replace_id);
        replace.replaceWith(div);
    } else {
        document.currentScript.replaceWith(div);
    }
    return div;
}

function forEachAlt(elements, callback){
    if (!elements || typeof callback !== "function") { return; }
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        callback(element);
    }
}

onloaded(function() {
    let windows = document.querySelectorAll(".window");
    forEachAlt(windows, function(element) {
        convertDiv2Window(element);
    });
});