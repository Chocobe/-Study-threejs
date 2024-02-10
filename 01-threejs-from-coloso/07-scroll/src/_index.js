document.body.style.height = '3000px';

window.addEventListener('scroll', () => {
    const currentScroll = document.documentElement.scrollTop;
    const scrollHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    const maxScroll = scrollHeight - windowHeight;
    const scrollPercent = currentScroll / maxScroll;

    console.clear();
    console.group('onScroll()');
    console.log('currentScroll: ', currentScroll);
    console.log('scrollHeight: ', scrollHeight);
    console.log('windowHeight: ', windowHeight);
    console.log('maxScroll: ', maxScroll);
    console.log('scrollPercent: ', scrollPercent.toFixed(2));
    console.groupEnd();
});
