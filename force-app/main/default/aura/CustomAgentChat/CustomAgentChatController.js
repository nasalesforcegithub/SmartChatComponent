({
    doInit: function(cmp, evt, helper) {
        //helper.sendLiveAgentMessage(cmp, evt, 'Welcome to Salesforce Chat. This conversation is being translated by Salesforce Einstein');
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
            var caseEventsArray = cmp.get("v.caseEvents");
            caseEventsArray.push(chatEvent);
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
    }
})