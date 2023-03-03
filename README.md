# Расширение Google Chrome для модуля Export/Import tool (3.x)

Расширение Google Chrome, которое позволяет сделать массовый импорт/экспорт несмотря на ограничения ресурсов хостинга. Расширение работает вместе с модулем [Export/Import tool](https://www.mhccorp.com/export-import-4).

<p align="center">
  <img alt="preview" src="https://github.com/yar-go/bulk-export-import-google-extention/blob/main/docs/prev.png?raw=true">
</p>

## Установка

Для того чтобы установить расширение, необходимо:

1. Убедится в том, что в магазине установлен модуль [Export/Import tool](https://www.mhccorp.com/export-import-4).
1. Скачать и распаковать [архив](https://github.com/yar-go/bulk-export-import-google-extention/archive/refs/heads/main.zip)
2. Зайти в настройки и управления Chrome [⋮] > Дополнительные инструменты > Расширения.
3. Включить режим разработчика
4. Нажать на "Загрузить распакованное расширение"
5. Выбрать папку "extension" из архива.



Для проверки, необходимо зайти в админ-панель магазина и перейти по таком пути System > Maintenance > Export/Import.
Если ви видите такое окно:
![Окно с приглашением для массового экспорта/импорта](https://github.com/yar-go/bulk-export-import-google-extention/blob/main/docs/export_window.png?raw=true)
То расширение успешно установлено✔

Если такого окна нет, то необходимо проверить присутствие в "пазлике" расширение "Bulk Export (alpha)". Если оно есть, то необходимо связаться со мной, для решения этой проблемы.

## Использование

Использование модуля [Export/Import tool](https://www.mhccorp.com/export-import-4) остается прежним. Однако, теперь нужно нажимать на кнопки "Bulk import" и "Bulk export".  
Расширение добавляет блок "Mass export of products" для вкладки экспорта и блок импорта для вкладки импорта. Оба блока содержат кнопку и поле ввода для указания количества товаров в одной порции.  
Поле "Number of products in one step" содержит число товаров в одной порции. По умолчанию, оно равно 1000, и изменять это число необязательно. Однако, если у вас слабый хостинг, то вы можете снизить количество товаров.  
Параметры, которые используются для фильтрации продуктов на вкладке экспорта и параметр типа обновления продуктов на вкладке импорта, работают так же, как и раньше.  
Также в меню расширения есть пункт меню, который вызывается с помощью иконки расширения. Это меню содержит комментарии и ошибки во время процесса импорта/экспорта, проверку обновления расширения и проверку страницы на то, что это страница модуля "Export/Import tool".


## Алгоритм работы

Алгоритм работы расширения базируется на разбиении товаров на порции.
При экспорте расширение, с помощью модуля, запрашивает порцию товаров, а затем объединяет все товары в одну большую таблицу.  
При импорте расширение работает аналогично, но уже разбивает одну большую таблицу на маленькие и отправляет каждую часть на сервер последовательно.

## Контакты и донаты

Контакты:
- Telegram [@sentix1](https://sentix1.t.me)
- Email: khaluza225@gmail.com

Донаты:
- XMR: 45iN2g3ymVghSxJ2WBs25PghRXxUo5qgxGd342k8GHcthsedyqS7oDNbGaZfLBEVecdrNzmWUXDcWZhtEz3vW9UpU1aUkdN
- KRB: KZynxxtPWpnb6BnrVgmYfXitgrXnKH36VafYipQfXzKUScwwE865b9rWK6U8yeBBt5iZyXcpbrtMBE63jiCYFbbH7SiNuqr
 