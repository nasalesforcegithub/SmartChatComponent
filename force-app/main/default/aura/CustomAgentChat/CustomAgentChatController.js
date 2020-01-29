({
    doInit: function(cmp, evt, helper) {

        // french connection START
        var currentDateTime = Date.now();
        cmp.set('v.currentDateTime', currentDateTime);
        helper.getContactName(cmp, evt);
        var userId = $A.get("$SObjectType.CurrentUser.Id");
        cmp.set("v.agentUserId", userId);
        // french connection END

        var recordId = cmp.get('v.recordId');
        var action = cmp.get('c.getPastChatEvents');
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('Handling response from event');
            console.log(response.getReturnValue());
            // apply mask for intent entities
            var chatEvents = helper.intentMasking(cmp, evt, response.getReturnValue());
            cmp.set('v.caseEvents', chatEvents);
        });
        action.setParams({
            chatId : recordId
        });
        $A.enqueueAction(action);
    },
    onTextAreaChange:function(cmp,evt,helper) {
        if(evt.which == 13) {
            evt.preventDefault();
            console.log('enter', evt);
            var agent_msg = cmp.get('v.chat_box_value') + '';
            var customer_language = cmp.get('v.customer_language');
            cmp.set('v.chat_box_value', '');
            console.log('something', agent_msg);
            
            helper.analyseText(cmp, agent_msg, helper, customer_language, 'Agent',  function(res){
                var chatEvent = res.getReturnValue();
                var caseEventsArray = cmp.get("v.caseEvents");
                caseEventsArray.push(chatEvent);
                cmp.set("v.caseEvents", caseEventsArray);
                cmp.set("v.aggregated_sentiment", chatEvent.Aggregated_Sentiment__c);
                console.log(chatEvent);
                console.log(caseEventsArray);
                helper.sendLiveAgentMessage(cmp, evt, chatEvent.Translation__c);                
                helper.setFocusedTabHighlighted(cmp,evt);
            });
        }
    },
    onNewMessage: function(cmp, evt, helper) {
        var content = evt.getParam('content');
        var agent_language = cmp.get('v.agent_language');        
        console.log('something',content)
        helper.analyseText(cmp, content, helper, agent_language, 'Customer',  function(res){
            console.log('Starting Text Analysis');
            var chatEvent = res.getReturnValue();
            chatEvent = helper.intentMasking(cmp, evt, [chatEvent]);
            var caseEventsArray = cmp.get("v.caseEvents");
            caseEventsArray.push(chatEvent[0]);
            cmp.set("v.caseEvents", caseEventsArray);
            cmp.set("v.aggregated_sentiment", chatEvent.Aggregated_Sentiment__c);
            console.log(chatEvent);
            console.log(caseEventsArray);            
        });
    },
    endChat: function(cmp, evt, helper) {
        helper.endChatAgent(cmp, evt);
    },
    onChatEnded: function(cmp, evt, helper) {
        helper.endChatCustomer(cmp,evt);        
    },

    // french connection START
    autoSendAgentMessage: function(cmp, evt, helper){
        var agent_msg = evt.getParam("Message");
        var customer_language = cmp.get('v.customer_language');
        console.log('something', agent_msg);
        
        helper.translateText(cmp, agent_msg, helper, customer_language, function(res) {
            var translatedText = res.getReturnValue();
            console.log('Posting translatedText = ' + translatedText);
            helper.addToComponentChat(cmp, evt, Date.now(),agent_msg, translatedText,'Agent');
            console.log('Sending message = ' + translatedText);
            helper.sendLiveAgentMessage(cmp, evt, translatedText);
            console.log('Send Message');
        });
    }, 
    onRender: function(cmp, evt, helper) {
        console.log("***************** rerender 2 ******************");
        var scroller = cmp.find("chatScrollerId");
        scroller.scrollTo("bottom",0,0);
    }
    // french connection END
})