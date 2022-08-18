import './sass/main.scss';

import scroll from './js/scroll';
import topArrow from './js/lift-up';

import fetchPixabay from './js/fetch-pixabay';
import cardTemplate from './template-card.hbs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

//стучусь к єлементам разметки//
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  goTopBtn: document.querySelector('.lift_up'),
  endcollectionText: document.querySelector('.end-collection-quote'),
};

//вызов лифта вверх//
topArrow();

refs.searchForm.addEventListener('submit', onFormSubmit);
let searchingData = '';
let page = 1;
let perPage = 0;
//let woah;

async function onFormSubmit(e) {
  //woah = e;
  e.preventDefault();

  searchingData = e.currentTarget.searchQuery.value;
  if (searchingData.trim() === '') {
    Notify.failure('Неа, воздух я искать не буду 😺');
    return;
  }
  const response = await fetchPixabay(searchingData, page);
  perPage = response.hits.length;

  if (response.totalHits <= perPage) {
    addISHidden();
  } else {
    removeIsHidden();
  }

  if (response.totalHits === 0) {
    clearGalleryHTML();
    refs.endcollectionText.classList.add('is-hidden');
    Notify.failure('Интересный запрос, правда, но такое ищи сам 💩');
  }
  try {
    if (response.totalHits > 0) {
      Notify.info(
        `Ты счастливчик! Отгружаю ${response.totalHits} единиц контента ✨`
      );
      clearGalleryHTML();
      renderCard(response.hits);
      refs.searchForm.reset();
    }
  } catch (error) {
    console.log(error);
  }
}

//кнопка для последующей загрузки контента//
refs.loadMoreBtn.addEventListener('click', loadMore);

async function loadMore() {
  try {
    refs.loadMoreBtn.disabled = true;
    pageIncrement();
    const response = await fetchPixabay(searchingData, page);

    renderCard(response.hits);
    perPage += response.hits.length;
    scroll();
    page += 1;

    if (perPage >= response.totalHits) {
      Notify.failure('Мы зашли в тупик. Картиночки закончились 🚩');
      addISHidden();
    }
    refs.loadMoreBtn.disabled = false;
  } catch (error) {
    console.log(error);
  }
}
//АПИшка//
function addISHidden() {
  refs.loadMoreBtn.classList.add('is-hidden');
  refs.endcollectionText.classList.remove('is-hidden');
}
function removeIsHidden() {
  refs.loadMoreBtn.classList.remove('is-hidden');
  refs.endcollectionText.classList.add('is-hidden');
}
function pageIncrement() {
  page += 1;
}
function clearGalleryHTML() {
  refs.gallery.innerHTML = '';
}
function lightbox() {
  let lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });
  lightbox.refresh();
}
function renderCard(array) {
  const cardMarkup = array.map(item => cardTemplate(item)).join('');
  refs.gallery.insertAdjacentHTML('beforeend', cardMarkup);
  lightbox();
  // observer.observe(target); //вызов бесконечного скролла после рендеринга разметки карточек-картинок//
}

//бесконечный скролл//
//const target = document.querySelector('.trigger-for-scroll');
//const options = {
//rootMargin: '300px',
//threshold: 1.0,
//};
//const callback = function (entries) {
//if (entries[0].isIntersecting) {
//onFormSubmit(woah);
//}
// entries.forEach(entry => { entries[0].isIntersecting; })
//console.log(entries[0].isIntersecting);
//};
//const observer = new IntersectionObserver(callback, options);
