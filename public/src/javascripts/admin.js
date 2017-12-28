'use strict';

import axios from 'axios';
import categories from './categoryHandler';

window.addCategory = function() {
    window.location.href = '/admin/new_category';
}

window.putCategory = function() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    axios.put('/admin/category', {title, description})
    .then(function (res) {
        window.location.href = "/admin";
    }).catch(function (err) {
        console.log(err);
    });
}

window.addChallenge = function() {
    window.location.href = '/admin/new_challenge';
}

window.removeCategory = function(id) {
    console.log(id);
    axios.delete('/admin/category/' + id)
    .then(function (res) {
        window.location.href = '/admin';
    }).catch(function (err) {
        console.log(err);
    });
}

window.putChallenge = function() {
    let name = document.getElementById('name').value;
    let description = document.getElementById('description').value;
    let difficulty = document.getElementById('difficulty').value;
    let testFile = document.getElementById('test_file').value;
    let defaultText = document.codeMirror.getValue();

    console.log(description);
    
    console.log("Save: ", name, description, difficulty, defaultText, testFile);

    axios.post('/admin/challenge', {name, description, categories, difficulty,
        defaultText, testFile})
    .then(function (res) {
        window.location.href = "/admin";
    }).catch(function (err) {
        console.log(err);
    });

}

window.patchChallenge = function(id) {
    let name = document.getElementById('name').value;
    let description = document.getElementById('description').value;
    let difficulty = document.getElementById('difficulty').value;
    let defaultText = document.codeMirror.getValue();
    let testFile = document.getElementById('test_file').value;

    console.log("Save: ", name, description, difficulty, defaultText, testFile);

    axios.patch('/admin/challenge/' + id, {name, description, categories, difficulty,
        defaultText, testFile})
    .then(function (res) {
        window.location.href = "/admin";
    }).catch(function (err) {
        console.log(err);
    });
}

window.patchCategory = function(id) {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;

    axios.patch('/admin/category/' + id, {title, description})
    .then(function (res) {
        window.location.href = "/admin";
    }).catch(function (err) {
        console.log(err);
    });
}

window.deleteChallenge = function(id) {
    console.log(id);
    axios.delete('/admin/challenge/' + id)
    .then(function (res) {
        window.location.href = '/admin';
    }).catch(function (err) {
        console.log(err);
    });
}