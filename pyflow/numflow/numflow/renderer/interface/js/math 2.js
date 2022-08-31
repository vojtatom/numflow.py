function sum(array) {
    var num = 0;
    for (var i = 0, l = array.length; i < l; i++) num += array[i];
    return num;
};

function mean(array) {
    return sum(array) / array.length;
};

function variance(array) {
    var m = mean(array);
    return mean(array.map(function(num) {
        return Math.pow(num - m, 2);
    }));
};

function standardDeviation(array) {
    return Math.sqrt(variance(array));
};

function meanAbsoluteDeviation(array) {
    var m = mean(array);
    return mean(array.map(function(num) {
        return Math.abs(num - m);
    }));
};

function median(array) {
    array.sort();
    let half = Math.floor(array.length/2);
    if(array.length % 2)
        return array[half];
    else
        return (array[half-1] + array[half]) / 2.0;
}

function max(array) {
    array.sort();
    return array[array.length - 1];
}