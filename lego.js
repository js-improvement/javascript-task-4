'use strict';
/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */

var parametr = [];
parametr.formq = [];
parametr.sortq = [];
parametr.filterq = [];
parametr.limitq = 10;
parametr.select = [];

exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...rest) {
    parametr = canonParametr(rest);
    var b = collection;
    b = b.filter(checkPerson);
    b = b.sort(sortPerson);
    b = deleteProperty(b);
    b = limitq(b);
    b = b.map(formPerson);

    return b;
};


function canonParametr(rest){
    var p = [];
    p['formq'] = [];
    p['sortq'] = [];
    p['filterq'] = [];
    p['limitq'] = [];
    p['select'] = [];
    for (var i = 0; i<rest.length; i++){
        if (rest[i] === undefined){
            continue;
        };
        var key = Object.keys(rest[i]);
        var key2 = Object.keys(rest[i][key[0]]);
        if (key2.length == 0){
            p[key[0]]= rest[i][key[0]] ;
            continue;
        }
        for (var j=0 ; j<key2.length; j++){
            p[key[0]][key2[j]] = rest[i][key[0]][key2[j]]
        }
    }
    return p;
}

/**
 * Функция преобразования атрибутов у объекта Person к зааданному в глобальной переменной parametr.formq формате
 * @param {Array}person
 * @returns {Array}person модификации
 */
function formPerson(person) {

    var key = Object.keys(parametr.formq); // получаем список полей, которые надо модифицировать
    for (var i = 0; i < key.length; i++) { // проходим по списку
        if (person[key] !== undefined) {  // Если функция модификаци определена
            person[key] = parametr.formq[key](person[key]); // применяем ее к соответсвующему полю Person
        }
    }

    return person;
}

/**
 * Функция обрезает справочник до указанного в parametr.limitq лимита
 * @param {Array}collection Справочник
 * @returns {Array}newCollect Справочник обрезанный до лимита
 */
function limitq(collection) {
    if (typeof (parametr.limitq) !== 'number' ) {
        return collection; // Если лимит не задан, то возвращаем справочник целиком
    }

    if (parametr.limitq >= collection.length) {
        return collection; // лимит больше текущего размера справочника, то возвращаем справочник целиком
    }
    var newCollect = [];
    for (var i = 0; i < parametr.limitq; i++) {
        newCollect[i] = collection[i];  // копируем поэлементно в новый справочник записи до лимита
    }

    return newCollect;
}

/**
 * функция удаляет из справочника поля, которые не запрошены для вывода
 * @param {Array)collection Справочник
 * @returns {Array}newCollect новый справочник, в котором присутствуют только заданные в parametr.select поля
 */
function deleteProperty(collection) {
    var newCollect = [];
    if (parametr.select.length<1){
        return collection;   // Проверяем, заданны ли поля для вывода, если нет, то возвращаем справочник
    }
    for (var i = 0; i < collection.length; i++) { // для каждого элемента справочника
        var newPerson = {};
        var oldPerson = collection[i];
        for (var j = 0; j < parametr.select.length; j++) {
            newPerson[parametr.select[j]] = oldPerson[parametr.select[j]]; // Копируем запрошенные поля в новый справочник
        }
        newCollect[i] = newPerson;
    }

    return newCollect;
}

/**
 * Функция проверки соответсвия Персоны из справочника запрошенным фильтрам.
 * @param {Array}person - Персона
 * @param a - не используется
 * @param b - не используется
 * @param {Array}param  Массив параметров фильстрации
 * @returns {Boolean}findOne Соответсвует ли Персон условиям фильтра или нет
 */
function checkPerson(person, a , b, param) {
    if (param === undefined){
        param = parametr;  // Если параметр Param  не задан, то смотрим фильтры в глобальной переменной.
        // Используется при вызове из filter
    }
    var key = Object.keys(param['filterq']); // получаем массив полей фильтрации уровня
    var findOne;
    for (var i = 0; i < key.length; i++) {  //Перебираем все поля фильтрации на этом уровне
        findOne = false;
        if (key[i]== 'or'){
            // Если поле для фильтрации OR, то Запускаем функцию обработки условия ИЛИ ( переходим на следующий уровень)
            // checkPersonOr() рекурсивно вызывает checkPerson() Для проверки условий следующего уровня
            findOne = checkPersonOr(person, param['filterq'][key[i]]);
        }  else {
            // Иначе запускаем функцию проверки соответсвия Персоны указанным параметрам
            findOne = checkPersonParametr(person, param.filterq[key[i]], key[i]);
        }
        if (findOne !== true) {
            // Если проверка поля вернуля False, то завершаем обработку Персон . ( Выполнение условия И)
            return false;
        }
    }

    return findOne;
}

/**
 * Обработка условия ИЛИ. Рекурсивно вызывает checkPerson с новым контекстом param для каждого условия входящего в оператор ИЛИ
 * @param {Array}person
 * @param {Array}param Параметры фильтрации на данном уровне вложенности
 * @returns {boolean} Резуультат обработки условия ИЛИ
 */
function checkPersonOr(person, param){
    var findOne = false;
    for (var i = 0; i < param.length; i++) { // Перебераем все параметры из param  и для каждого запускаем checkPerson
        findOne = checkPerson(person, null, null, param[i]);
        if (findOne === true) {
            return true;  // Если Персона соответсвует хоть одному условию, то возвращаем TRUE. Условие ИЛИ
        }
    }
    return findOne
}

/**
 * Проверка соответсвия Персоны параметрам
 * @param {Array}person
 * @param {Array}key искомые значения
 * @param {string]p Ключ для сравнения
 * @returns {boolean}
 */
function checkPersonParametr(person, key, p) {
    var findOne = false;
    for (var j = 0; j < key.length; j++) { //Перебираем все искомые значения
        var value = key[j];
        if (person[p] === value) {
            findOne = true; // Если значение найдено у Персоны в требуемом свойстве, то возвращаем true
            break;
        }
    }

    return findOne;

}

/**
 * Сравнение двух персон по указанным в parametr.sortq полям и порядку сортировки
 * @param pers1
 * @param pers2
 * @returns {number} результат 1 если pers1 больше, -1 - меньше. 0 - равны
 */
function sortPerson(pers1, pers2) {
    var key = Object.keys(parametr.sortq); // получаем список полей для сортировки
    for (var i = 0; i < key.length; i++) { // Для каждого поля запускаем сравнение
        var res = compere(pers1[key[i]], pers2[key[i]], parametr.sortq[key[i]]);
        if (res !== 0) { // Если они равны - переходим к следующему. Иначе возвращаем результат
            return res;
        }

    }

    return 0;
}

/**
 * Функция сопоставление
 * @param fArg Первое значение
 * @param sArg Второе значение
 * @param asc Порядок сортировки 1 если asc , -1 если desc
 * @returns {*}
 */
function compere(fArg, sArg, asc) {
    if (fArg === sArg) {
        return 0;
    }
    if (fArg > sArg || sArg === undefined) {
        return asc;
    }
    if (fArg < sArg || fArg === undefined) {
        return -1 * asc;
    }
}

/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function () {

    var arr = [];
    for (var i = 0; i < arguments.length; i++) {
        arr.push(arguments[i]);
    }
    var res = [];
    res.select = arr;

    return res;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    var res = [];
    res['filterq'] =[];
    res['filterq'][property] = values;
    return res;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function (property, order) {
    var asc = 0;
    if (order === 'asc') {
        asc = 1;
    } else if (order === 'desc') {
        asc = -1;
    }
    var res = [];
    res.sortq = [];
    res.sortq[property] = asc;

    return res;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {
    var res = [];
    res.formq = [];
    res.formq[property] = formatter;

    return res;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = function (count) {
    var res = [];
    res.limitq = count;

    return res;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function (...rest) {
        var res = [];
        res['filterq'] =[];
        res['filterq']['or'] = [];
        for (var i = 0; i<rest.length; i++){
            var key = rest[i];
            res['filterq']['or'][i] = key;
        }

        return res;

    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function (...rest) {
        var res = [];
        res['filterq']=[]
        for (var i=0; i<rest.length; i++){
            var key = Object.keys(rest[i]['filterq']);
            for (var j=0; j<key.length; j++){
                res['filterq'][key[j]] = rest[i]['filterq'][key[j]];
            }

        }
        return res;
    };
}

