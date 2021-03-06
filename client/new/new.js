Template.new.helpers({
  item: function(){
    var _id = Router.current().params._id;
    if(!_id)
      return undefined;

    return Items.findOne({_id:_id});
  },
  groups: function(){
    return Groups.find().fetch();
  }
});

Template.new.events({
  'click #new-item-submit': function() {

    var quantity = parseInt(document.getElementById("new-item-quantity").value);
    var position = parseInt(document.getElementById("new-item-position").value);

    if(!quantity || !position)
      return;

    var item = {
      name: document.getElementById("new-item-name").value,
      description: document.getElementById("new-item-description").value,
      price: document.getElementById("new-item-price").value,
      group: document.getElementById("new-item-group").value,
      quantity: quantity,
      position: position
    }

    var files = document.getElementById("new-item-picture").files;

    var _id = Router.current().params._id;
    var existingItem = Items.findOne({_id:_id});
    //if we're editing an already existing item
    if(existingItem){

      item._id = existingItem._id;
      item.visible = existingItem.visible;

      //if there's a new picture
      if(files[0]){

        S3.delete(existingItem.imageUrl);

        S3.upload({files:files} ,function(err, data){
          if(err){
            console.log("an error has occurred with the picture upload.");
            console.log(err);
          }
          else{
            item.imageUrl = data.url;
            Meteor.call("newItem", item);
            Router.go("/menu");
          }
        });
      }
      // else, there is no new picture
      else{
        item.imageUrl = existingItem.imageUrl;
        Meteor.call("newItem", item);
        Router.go("/menu");
      }
    }
    //else, it's a completely new item
    else{

      //a picture is required
      if(!files[0])
        return;

      S3.upload({files:files} ,function(err, data){
        if(err){
          console.log("an error has occurred with the picture upload.");
          console.log(err);
        }
        else{
          item.imageUrl = data.url;
          Meteor.call("newItem", item);
          Router.go("/menu");
        }
      });
    }
  }
})