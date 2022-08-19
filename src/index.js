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

//refs.searchForm.addEventListener('submit', onFormSubmit);

//сделали функцию чтобы при вводе пустой строки - скрывало(кнопку) то, что было до нового поиска//
refs.searchForm.addEventListener('submit', e => {
  refs.gallery.innerHTML = '';
  onFormSubmit(e);
  refs.loadMoreBtn.classList.add('is-hidden');
});
//объявляем 3 глобальные переменные, которые будут числиться в нижестоящих функциях
let searchingData = '';
let page = 1;
let perPage = 0;

//функция , которая будет отрабатывать при сабмите формы. 1 Чтобы стр не перезагружалась
async function onFormSubmit(e) {
  e.preventDefault();
  //получаю значение на 41, каждый поиск при любом случае выдает первую страницу (42 стр)
  searchingData = e.currentTarget.searchQuery.value;
  page = 1;
  //убираем тримом пробелы, в условии чисто пустая строка
  if (searchingData.trim() === '') {
    Notify.failure('Неа, воздух я искать не буду 😺');
    return;
  }
  //переменная апишки
  ///searchingData -условия поиска (кот или пес ... ), + page это номер страницы, которая сразу выводиться (первая в нашем случае)
  const response = await fetchPixabay(searchingData, page);
  perPage = response.hits.length;

  //если кол-во картинок в апишке меньше либо равно количеству картинок на 52 строке, то удлаяет кнопку лоад мо и выводит финальную цитату
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
      //refs.searchForm.reset();
    }
  } catch (error) {
    console.log(error);
  }
}

//кнопка для последующей загрузки контента//
refs.loadMoreBtn.addEventListener('click', loadMore);

async function loadMore() {
  try {
    ///функция при клике отключается кнопка и добавляется еще одна страница
    refs.loadMoreBtn.disabled = true;
    pageIncrement();
    const response = await fetchPixabay(searchingData, page);

    renderCard(response.hits);
    //к общему количеству уже имеющихся добавляем новые картинки, вся масса заполняет страницу
    perPage += response.hits.length;
    scroll();
    //общее кол-во фоток если больше или равно имеющимся на бэкэнде фоткам
    if (perPage >= response.totalHits) {
      Notify.failure('Мы зашли в тупик. Картиночки закончились 🚩');
      //прячим кнопку лоад мор
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
//использовали выше, функция по увеличению кол-ва страниц (юзали на )
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
}
