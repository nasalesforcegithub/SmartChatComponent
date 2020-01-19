({
    /*
    addToComponentChat: function(cmp, evt, timestamp, transcript,translation, spokenby) {
        var caseEventsArray = cmp.get("v.caseEvents");            
        caseEventsArray.push({
            Event_Time__c: timestamp,
            Type__c: 'Speech',
            Transcript__c: transcript,
            Spoken_By__c: spokenby,
            id: '',
            Name: 'name'
        });
        caseEventsArray.push({
            Event_Time__c: timestamp,
            Type__c: 'Translation',
            Transcript__c: translation,
            Spoken_By__c: spokenby,
            id: '',
            Name: 'name'
        });
        console.log(caseEventsArray);
        cmp.set("v.caseEvents", caseEventsArray); 
        //var scrollVar = cmp.find("scrollerId");                
        //scrollVar.scrollto("bottom");
    },
    */
    /*
    addEventToChat: function(cmp, evt, timestamp, transcript) {
        var caseEventsArray = cmp.get("v.caseEvents");      
        caseEventsArray.push({
            Event_Time__c: timestamp,
            Type__c: 'Event',
            Transcript__c: transcript,
            id: '',
            Name: 'name'
        });
        console.log(caseEventsArray);
        cmp.set("v.caseEvents", caseEventsArray); 
        //var scrollVar = cmp.find("scrollerId");                
        //scrollVar.scrollto("bottom");
    }, 
    */
    sendLiveAgentMessage: function(cmp, evt, msg) {
        console.log('About to Send Message');
        var conversationKit = cmp.find("conversationKit");
        var recordId = cmp.get("v.recordId");
        conversationKit.sendMessage({
            recordId: recordId,
            message: {text:msg}
        })
        .then(function(result){
            if (result) {
                console.log("Successfully sent message");
            } else {
                console.log("Failed to send message");
            }
        });
    },
    endChatAgent: function(cmp, evt) {
        var conversationKit = cmp.find("conversationKit");
        var recordId = cmp.get("v.recordId");
        var caseEventsArray = cmp.get("v.caseEvents");   
        let endChatButton = cmp.find("endChatButton");
        let chatTextArea = cmp.find("chatTextArea");
        
        conversationKit.endChat({
            recordId: recordId
        })
        .then(function(result){
            console.log('Posting end chat message')
            caseEventsArray.push({
                Event_Time__c: Date.now(),
                Type__c: 'End Chat',
                Transcript__c: 'Agent',
                Spoken_By__c: 'Agent',
                id: '',
                Name: 'name'
            });
            console.log(caseEventsArray);
            cmp.set("v.caseEvents", caseEventsArray);
            endChatButton.set('v.disabled',true);
            chatTextArea.set('v.disabled',true);
        });
    },
    endChatCustomer: function(cmp, evt){
        var caseEventsArray = cmp.get("v.caseEvents");   
        let endChatButton = cmp.find("endChatButton");
        let chatTextArea = cmp.find("chatTextArea");
        caseEventsArray.push({
            Event_Time__c: Date.now(),
            Type__c: 'End Chat',
            Transcript__c: 'Lauren Bailey',
            Spoken_By__c: 'Customer',
            id: '',
            Name: 'name'
        });
        console.log(caseEventsArray);
        cmp.set("v.caseEvents", caseEventsArray);
        endChatButton.set('v.disabled',true);
        chatTextArea.set('v.disabled',true);
    },
    analyseText: function(cmp, msg, helper, lang, spokenBy,  callback){
        var action = cmp.get('c.analyseChatString');
        var recordId = cmp.get('v.recordId');
        var intentModel = cmp.get('v.einstein_intent_model');        
        var sentimentValue = cmp.get('v.aggregated_sentiment');
        var messageNumber = cmp.get('v.message_number');
        console.log(messageNumber);
        messageNumber = messageNumber+1;
        cmp.set('v.message_number', messageNumber);
        console.log(messageNumber);
        
        console.log('To Language is: ' + lang);
        action.setParams({
            chatString: msg,
            toLanguage: lang,
            chatId: recordId,
            spokenBy: spokenBy,
            intentModel: intentModel,
            currentSentiment: sentimentValue,
            currentPosition: messageNumber
        });
        action.setCallback(this, callback);
        $A.enqueueAction(action);
    },
    
    analyseNER: function(cmp, msg, helper, spokenBy, callback){
        var action = cmp.get('c.getChatNER');
        var recordId = cmp.get('v.recordId');                
        //var intentModel = cmp.get('v.einstein_intent_model');
        console.log('Running NER Analysis on Model: NER7' + ' and String ' + msg);
        action.setParams({
            chatString: msg,
            //intentModel: intentModel,
            //chatId: recordId,
            spokenBy: spokenBy
        });
        action.setCallback(this, callback);
        $A.enqueueAction(action);
    },
    
    /*
    translateText: function(cmp, msg, helper, lang, spokenBy, callback){
        var action = cmp.get('c.getChatTranslation');
        var recordId = cmp.get('v.recordId');        
        console.log('To Language is: ' + lang);
        action.setParams({
            chatString: msg,
            toLanguage: lang,
            chatId: recordId,
            spokenBy: spokenBy
        });
        action.setCallback(this, callback);
        $A.enqueueAction(action);
    },
    analyseIntent: function(cmp, msg, helper, spokenBy, callback){
        var action = cmp.get('c.getChatIntent');
        var recordId = cmp.get('v.recordId');                
        var intentModel = cmp.get('v.einstein_intent_model');
        console.log('Running Intent Analysis on Model: ' + intentModel + ' and String ' + msg);
        action.setParams({
            chatString: msg,
            intentModel: intentModel,
            chatId: recordId,
            spokenBy: spokenBy
        });
        action.setCallback(this, callback);
        $A.enqueueAction(action);
    },
    

    analyseSentiment: function(cmp, msg, helper, spokenBy, callback){
        var action = cmp.get('c.getChatSentiment');
        var recordId = cmp.get('v.recordId');                
        var sentimentValue = cmp.get('v.aggregated_sentiment');
        console.log('Running Sentment Analysis on: ' + msg);
        action.setParams({
            chatString: msg,
            currentSentiment: sentimentValue,
            chatId: recordId,
            spokenBy: spokenBy
        });
        action.setCallback(this, callback);
        $A.enqueueAction(action);
    }, */
    setFocusedTabHighlighted : function(cmp, evt) {
        var workspaceAPI = cmp.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;
            workspaceAPI.setTabHighlighted({
                tabId: focusedTabId,
                highlighted: false
            });
        })
        .catch(function(error) {
            console.log(error);
        });
    }
})