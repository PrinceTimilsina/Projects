const players = [
    { name: 'ST', x: 43, y: 13 },
    { name: 'LW', x: 14, y: 23 },
    { name: 'RW', x: 73, y: 23 },
    { name: 'CAM', x: 43, y: 29 },
    { name: 'CM', x: 18, y: 39 },
    { name: 'CM', x: 73, y: 39 },
    { name: 'LB', x: 14, y: 59 },
    { name: 'CB', x: 35, y: 68 },
    { name: 'CB', x: 58, y: 68 },
    { name: 'RB', x: 75, y: 59 },
    { name: 'GK', x: 44, y: 83 } // ✅ moved up slightly
];

const pitch = document.querySelector('.pitch');

// Create input element for editing names
const nameInput = document.createElement('input');
nameInput.className = 'name-input';
document.body.appendChild(nameInput);

players.forEach(player => {
    const playerEl = document.createElement('div');
    playerEl.className = 'player';
    playerEl.innerHTML = `
        <div class="player-dot"></div>
        <div class="player-name">${player.name}</div>
    `;
    playerEl.style.left = `${player.x}%`;
    playerEl.style.top = `${player.y}%`;
    pitch.appendChild(playerEl);
    
    makeDraggable(playerEl);

    // Add double-click listener for name editing
    const nameEl = playerEl.querySelector('.player-name');
    nameEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        
        // Position and show input
        const rect = nameEl.getBoundingClientRect();
        nameInput.style.left = rect.left + 'px';
        nameInput.style.top = rect.top + 'px';
        nameInput.style.width = rect.width + 'px';
        nameInput.value = nameEl.textContent;
        nameInput.style.display = 'block';
        nameInput.focus();

        // Handle input blur
        const handleBlur = () => {
            nameEl.textContent = nameInput.value;
            nameInput.style.display = 'none';
            nameInput.removeEventListener('blur', handleBlur);
            nameInput.removeEventListener('keypress', handleEnter);
        };

        // Handle enter key
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                nameInput.blur();
            }
        };

        nameInput.addEventListener('blur', handleBlur);
        nameInput.addEventListener('keypress', handleEnter);
    });
});

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target.classList.contains('player-name')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        const newTop = element.offsetTop - pos2;
        const newLeft = element.offsetLeft - pos1;
        
        // Keep player within pitch bounds
        const bounds = pitch.getBoundingClientRect();
        const elBounds = element.getBoundingClientRect();
        
        if (newTop >= 0 && newTop <= bounds.height - elBounds.height) {
            element.style.top = newTop + "px";
        }
        if (newLeft >= 0 && newLeft <= bounds.width - elBounds.width) {
            element.style.left = newLeft + "px";
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function saveFormation() {
    const players = [];
    document.querySelectorAll('.player').forEach(player => {
        players.push({   
            name: player.querySelector('.player-name').textContent,
            x: (player.offsetLeft / pitch.offsetWidth) * 100,
            y: (player.offsetTop / pitch.offsetHeight) * 100
        });
    });
    console.log(players);
    localStorage.setItem('formation', JSON.stringify(players));
    alert('Formation saved!');
}

function loadFormation() {
    const savedPlayers = JSON.parse(localStorage.getItem('formation'));
    if (savedPlayers) {
        document.querySelectorAll('.player').forEach((player, index) => {
            player.style.left = `${savedPlayers[index].x}%`;
            player.style.top = `${savedPlayers[index].y}%`;
            player.querySelector('.player-name').textContent = savedPlayers[index].name;
        });
    }
}