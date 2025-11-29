const stylesDictionary: { [key: string]: string } = {
    'style1': 'style-1.css',
    'style2': 'style-2.css',
    'style3': 'style-3.css'
};

let currentStyle: string = 'style1';

function changeStyle(newStyle: string): void {
    const oldLink = document.querySelector('link[rel="stylesheet"]');
    if (oldLink) {
        oldLink.remove();
    }

    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = stylesDictionary[newStyle];
    document.head.appendChild(newLink);

    currentStyle = newStyle;
}

function generateStyleLinks(): void {
    const linksContainer = document.getElementById('style-links');
    if (!linksContainer) return;

    Object.keys(stylesDictionary).forEach(style => {
        const linkElement = document.createElement('a');
        linkElement.href = '#';
        linkElement.textContent = `Zmień na ${style}`;
        linkElement.addEventListener('click', (event) => {
            event.preventDefault();
            changeStyle(style);
        });

        linksContainer.appendChild(linkElement);
        linksContainer.appendChild(document.createElement('br'));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const initialLink = document.createElement('link');
    initialLink.rel = 'stylesheet';
    initialLink.href = stylesDictionary[currentStyle];
    document.head.appendChild(initialLink);

    generateStyleLinks();
});
