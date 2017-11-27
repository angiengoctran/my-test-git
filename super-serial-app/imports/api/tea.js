import { Mongo } from 'meteor/mongo';
 
export const Tea = new Mongo.Collection('tea');
import { check } from 'meteor/check';


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('tea', function teaPublication() {
    return Tea.find({});
  });
}

// http://docs.meteor.com/api/collections.html#Mongo-Collection-upsert
Meteor.methods({
  'tea.upsert'(type, id, start, finish) {
    check(type, String);
 
    let currentTea = Tea.upsert({
      _id: id
    },
    {
      $set: {
        type: type,
        start: start,
        finish: finish,
        updatedAt: new Date(),
      }
    });
    return currentTea.insertedId;
  },
  'tea.update.finish'(id,value) {

    Tea.update({
      _id: id
    },
    {
      $set: {
        finish: value,
        updatedAt: new Date(),
      }
    });
  },
  'tea.update.temp'(id,value) {

    Tea.update({
      _id: id
    },
    {
      $set: {
        temp: value,
        updatedAt: new Date(),
      }
    });
  }
})