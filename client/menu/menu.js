
Template.menu.helpers({
  items: function(){
    return Items.find().fetch();
  },
  quantity: function(_id) {
    var cart = Session.get("cart");
    var q = _.find(cart, function(i){
      return i._id == _id;
    });
    if(q)
      return q.cartQuantity;
    else
      return 0;
  },
  cartItems: function(){
    var cart = Session.get("cart");
    _.filter(cart, function(i){
      return (i.cartQuantity && i.cartQuantity != 0)
    });
    return cart;
  },
  total: function() {
    var items = Template.menu.__helpers[" cartItems"]()
    var total = 0;
    _.forEach(items, function(item){
      total += parseFloat(item.price) * item.cartQuantity;
    });
    return total;
  },
  totalWithTax: function() {
    var total = Template.menu.__helpers[" total"]()
    return (total * 1.075).toFixed(2);
  },
  disableButton: function() {
    var cart = Session.get("cart");
    return cart && cart.length != 0;
  }
});

Template.menu.events({
  'click .menu-item-up': function(event){
    var id = event.target.id.replace("item-", "");
    var cart = Session.get("cart");
    var item = _.find(cart, function(i){
      return i._id == id;
    });

    if(!item){
      if(!cart)
        cart = [];

      item = Items.findOne({_id: id});
      cart.push(item);
    }

    if(!item.cartQuantity){
      item.cartQuantity = 0;
    }
    item.cartQuantity++;

    Session.set("cart", cart);
  },
  'click .menu-item-down': function(event){
    var id = event.target.id.replace("item-", "");
    var cart = Session.get("cart");
    var item = _.find(cart, function(i){
      return i._id == id;
    });

    if(!item){
      if(!cart)
        cart = [];
      item = Items.findOne({_id: id});
      cart.push(item);
    }

    if(!item.cartQuantity){
      item.cartQuantity = 0;
    }

    if(item.cartQuantity >= 1){
      item.cartQuantity--;
      if(item.cartQuantity === 0){
        _.remove(cart, function(n){
          return n.quantity === 0;
        });
      }
    }

    Session.set("cart", cart);
  },

  'click #current_cart': function (event) {
    event.preventDefault();
    $('html, body').animate({
      scrollTop: $("#cart-wrapper").offset().top
    }, 600);
  },

  'click .delete':function(event) {
    Meteor.call('destroyItem', this._id); // is there a safer way to do this?

    // Best effort, we don't really care about the result.
    S3.delete(this.imageUrl);
  }
});
