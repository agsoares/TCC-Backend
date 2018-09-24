const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();

exports.createUserData = functions
    .auth
    .user()
    .onCreate((user) => {
        var userData = {
            balance: 0.0
        };

        var accountsData = {
            balance: 0.0
        };

        var userPromise = db.collection("users")
            .doc(user.uid)
            .set(userData)
            .then(function () {
                console.log("Document successfully written!");
            });
        var accountPromise = db.collection('users')
            .doc(user.uid)
            .collection('accounts')
            .add(accountsData)
            .then(function () {
                console.log("Document successfully written!");
            });

        return Promise.all([userPromise, accountPromise])
});

exports.updateUserBalance = functions
    .firestore
    .document('users/{userId}/accounts/{accountId}')
    .onWrite((change, context) => {
        var accountsRef = db.collection('users')
            .doc(context.params.userId)
            .collection('accounts')

        var userRef = db.collection('users')
            .doc(context.params.userId)

        return db.runTransaction(transaction => {
            return transaction.get(accountsRef).then(accounts => {
                var accountBalance = accounts.docs.reduce((a, c) => a + c.get('balance'), 0) 

                return transaction.update(userRef, {
                    balance: accountBalance
                })
            })
        });
    })

