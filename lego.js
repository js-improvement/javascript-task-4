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
exports.query = function (collection) {

    var a = JSON.stringify(collection);
    var b = JSON.parse(a);
    b = b.filter(checkPerson).sort(sortPerson);
    b = deleteProperty(b);
    b = limitq(b);
    b = b.map(formPerson);
    cleanParametr();

    return b;
};

function cleanParametr() {
    parametr.formq = [];
    parametr.sortq = [];
    parametr.filterq = [];
    parametr.limitq = 10;
    parametr.select = [];
}
function formPerson(person) {

    var key = Object.keys(parametr.formq);
    for (var i = 0; i < key.length; i++) {
        if (person[key] !== undefined) {
            person[key] = parametr.formq[key](person[key]);
        }
    }

    return person;
}


function limitq(collection) {

    if (parametr.limitq >= collection.length) {
        return collection;
    }
    var newCollect = [];
    for (var i = 0; i < parametr.limitq; i++) {
        newCollect[i] = collection[i];
    }

    return newCollect;
}

function deleteProperty(collection) {
    var newCollect = [];
    for (var i = 0; i < collection.length; i++) {
        var newPerson = {};
        var oldPerson = collection[i];
        for (var j = 0; j < parametr.select.length; j++) {
            newPerson[parametr.select[j]] = oldPerson[parametr.select[j]];
        }
        newCollect[i] = newPerson;
    }

    return newCollect;
}

function checkPerson(person) {
    var key = Object.keys(parametr.filterq);
    var findOne;
    for (var i = 0; i < key.length; i++) {
        findOne = false;
        findOne = checkPersonParametr(person, parametr.filterq[key[i]], key[i]);
        if (findOne !== true) {
            return false;
        }
    }

    return findOne;
}
function checkPersonParametr(person, key, p) {
    var findOne = false;
    for (var j = 0; j < key.length; j++) {
        var value = key[j];
        if (person[p] === value) {
            findOne = true;
            break;
        }
    }

    return findOne;

}

function sortPerson(pers1, pers2) {
    var key = Object.keys(parametr.sortq);
    for (var i = 0; i < key.length; i++) {
        var res = compere(pers1[key[i]], pers2[key[i]], parametr.sortq[key[i]]);
        if (res === 0) {
            continue;
        } else {
            return res;
        }

    }

    return 0;
}

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
    parametr.select = arr;

    return;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    parametr.filterq[property] = values;
  //  console.info(parametr);
  //  console.info(parametr);

    return;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function (property, order) {
    // sort.push([property, order]);
    var asc = 0;
    if (order === 'asc') {
        asc = 1;
    } else if (order === 'desc') {
        asc = -1;
    }
    parametr.sortq[property] = asc;
  //  console.info(parametr);

    return;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {
    parametr.formq[property] = formatter;

   // console.info(parametr);

    return;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = function (count) {
    parametr.limitq = count;
  //  console.info(parametr);

    return;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function () {
        return;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        return;
    };
}

