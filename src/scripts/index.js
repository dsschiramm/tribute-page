(function () {
	'use strict';

	const button = document.getElementById('button-next');
	let count = 0;

	function goNext() {
		let hiddenItens = document.querySelectorAll('.hide-item');
		let activeItem = document.querySelectorAll('.content-item:not(.hide-item)')[0];

		activeItem.classList.add('hide-item');
		hiddenItens[count].classList.remove('hide-item');

		count++;

		if (count === hiddenItens.length) {
			count = 0;
			button.innerText = 'Início';
		} else {
			button.innerText = 'Próximo';
		}
	}

	button.addEventListener('click', goNext);

	const images = ['images/banner.jpg', 'images/banner2.jpg', 'images/banner3.jpg', 'images/banner4.jpg'];
	let imageHead = document.getElementById('image');
	let i = 1;

	setInterval(function () {
		imageHead.src = images[i];
		i = i === images.length - 1 ? 0 : i + 1;
	}, 3500);
})();
