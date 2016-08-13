function ListItem(item) {
    this.item = item
    this.addtem = function(item){
      console.log('this '+ item +' has been added');
    }
}



var dude = new ListItem();
dude.item = 'whoa';

dude.addItem(dude.item);
