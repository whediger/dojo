
function arrayToList(arrayIn) {
    var list = null;
    for (var i = arrayIn.length -1; i >= 0; i--) {
        list = {
            value: arrayIn[i],
            rest: list
        };
    }
    console.log(list);
    listToArray(list);
}

arrayToList([1,2,3]);


function listToArray(listIn){
    console.log("+==={========>");
    var arr = [];
    for (var list = listIn; list; list = list.rest) {
        arr.push(list.value);
        console.log(listIn);
        console.log(arr);
    }
}
