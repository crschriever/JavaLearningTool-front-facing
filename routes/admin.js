const express = require('express');
const router = express.Router();
const request = require('request');

const logger = require('../logger.js');

const Challenge = require('../models/challenge.js');
const Category = require('../models/challenge_category.js');
const Message = require('../models/message.js');

function newLineToBreak(str) {
    str = str.trim();
    return str.replace(/\n/g, "<br>");
}

router.use('/admin', function(req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/login');
    }
});

router.get('/admin', function(req, res, next) {
    
    let callbackCount = 0;
    let challenges, categories, messages;

    let callback = function() {
        callbackCount++;
        if (callbackCount >= 3) {
            res.render("admin", {
                categories,
                challenges,
                messages,
                removeHeader: true,
                title: "Admin",
                styles: ["adminStyle"],
                scripts: ["adminBundle"]
            });
        }
    }
    
    Challenge.find({}, function(err, challs) {
        challenges = challs;
        callback();
    });
        
    Category.find({}, function(err, cats) {
        categories = cats;
        callback();
    });

    Message.find({}, function(err, mess) {
      messages = mess;
      callback();
    });
});

router.get('/admin/new_category', function(req, res, next) {
    res.render("new_category", {
      title: "Admin",
      removeHeader: true,
      styles: ["adminStyle"],
      scripts: ["adminBundle"]
    });
});

router.get('/admin/new_challenge', function(req, res, next) {
    Category.find({}, function(err, categories) {
        res.render("new_challenge", {
          title: "Admin",
          codeBox: true,
          removeHeader: true,
          styles: ["codemirror", "adminStyle"],
          scripts: ["adminBundle", "codemirror", "clike"],
          categories
        });
    });
});

router.get("/admin/new_message", function(req, res, next) {
    res.render("new_message", {
        title: "Admin",
        removeHeader: true,
        styles: ["adminStyle"],
        scripts: ["adminBundle"]
    });
});

router.get('/admin/category/:id', function(req, res, next) {
    
    Category.findOne({_id: req.params.id}, function(err, category) {
        if (err) {
            logger.error("Error finding category with id: ", req.params.id, err);
            next();
            return;
        }

        res.render("patch_category", {
          title: category.title,
          removeHeader: true,
          styles: ["adminStyle"],
          scripts: ["adminBundle"],
          category
        });
    });

});

router.get('/admin/challenge/:id', function(req, res, next) {
    
    categories = [];
    challenge = {};

    let callback = function(err) {

        if (err) {
            logger.error("Error in /admin/challenge/:id route with challenge id: ", req.params.id, err);
            next();
            return;
        }

        callbackCount++;
        if (callbackCount < 2) {
            return;
        }

        logger.debug("Challenge: " + challenge);

        res.render("patch_challenge", {
          title: challenge.name,
          codeBox: true,
          removeHeader: true,
          styles: ["codemirror", "adminStyle"],
          scripts: ["adminBundle", "codemirror", "clike"],
          challenge,
          categories
        });
    }

    Challenge.findOne({_id: req.params.id}, function(err, chall) {
        challenge = chall;
        callback(err)
    });

    Category.find({}, function(err, cats) {
        categories = cats;
        callback(err);
    });

    let callbackCount = 0;
});

router.get('/admin/message/:id', function(req, res, next) {
    
    Message.findOne({_id: req.params.id}, function(err, message) {
        if (err) {
            logger.error("Error finding message with id: ", req.params.id, err);
            next();
            return;
        }

        res.render("patch_message", {
          title: message.title,
          removeHeader: true,
          styles: ["adminStyle"],
          scripts: ["adminBundle"],
          message
        });
    });

});

router.put('/admin/category', function(req, res, next) {
    let newCat = Category({
        title: req.body.title,
        description: req.body.description,
        featured: req.body.featured
    });

    newCat.save(function(err) {
        if (err) {
            logger.error("Error saving new category", err);
            res.json({error: "Request failed!"});
            return;
        }

        res.json({});
    });
});

router.post('/admin/challenge', function(req, res, next) {
    
    try {
        let newChall = Challenge({
          name: req.body.name,
          description: newLineToBreak(req.body.description),
          categories: req.body.categories,
          difficulty: req.body.difficulty,
          defaultText: req.body.defaultText,
          testFile: req.body.testFile,
          className: req.body.className
        });

        newChall.save(function(err) {
            if (err) {
                logger.error("Error in route /admin/challenge saving challenge. ", err);
                res.redirect('/admin/new_challenge');
                return;            
            }
            res.redirect('/admin');
        });
    } catch(err) {
        logger.error("Error in route /admin/challenge. ", err);
        res.redirect('/admin/new_challenge');
    }
});

router.put('/admin/message', function(req, res, next) {
    let newMess = Message({
        title: req.body.title,
        body: req.body.body,
        links: req.body.links
    });

    newMess.save(function(err) {
        if (err) {
            logger.error("Error saving new message", err);
            res.json({error: "Request failed!"});
            return;
        }

        res.json({});
    });
});

router.patch('/admin/category/:categoryId', function(req, res, next) {
    Category.findByIdAndUpdate(req.params.categoryId, {$set: req.body}, function(err) {
        if (err) {
            logger.error("Error updating category with id: ", req.params.categoryId, err);
            res.json({error: true});
            return;
        }
        res.json({});
    });
});

router.patch('/admin/challenge/:challengeId', function(req, res, next) {
    req.body.description = newLineToBreak(req.body.description);

    Challenge.findByIdAndUpdate(req.params.challengeId, {$set: req.body}, function(err) {
        if (err) {
            logger.error("Error updating challenge with id: ", req.params.challengeId, err);
            res.json({error: true});
            return;
        }
        res.json({});
    });
});

router.patch('/admin/message/:messageId', function(req, res, next) {
    Message.findByIdAndUpdate(req.params.messageId, {$set: req.body}, function(err) {
        if (err) {
            logger.error("Error updating message with id: ", req.params.messageId, err);
            res.json({error: true});
            return;
        }
        res.json({});
    });
});

router.delete('/admin/category/:categoryId', function(req, res, next) {
    Category.findByIdAndRemove(req.params.categoryId, function(err) {
        if (err) {
            logger.error("Error removing category with id: ", req.params.categoryId, err);
            res.json({error: true});
        } else {
            // remove category from all challenges
            Challenge.update({}, {$pull: {categories: req.params.categoryId}}, {multi: true}, function(err) {
                res.json({});
            });
        }
    });
});

router.delete('/admin/challenge/:challengeId', function(req, res, next) {
    Challenge.findByIdAndRemove(req.params.challengeId, function(err) {
        if (err) {
            logger.error("Error removing challenge with id: ", req.params.challengeId, err);
            res.json({error: true});
        } else {
            res.json({});
        }
    });
});

router.delete('/admin/message/:messageId', function(req, res, next) {
    Message.findByIdAndRemove(req.params.messageId, function(err) {
        if (err) {
            logger.error("Error removing message with id: ", req.params.messageId, err);
            res.json({error: true});
        } else {
            res.json({});
        }
    });
});

module.exports = router;