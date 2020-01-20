public class ChatInterceptCtrl {
    
    @AuraEnabled
    public static Chat_Event__c analyseChatString(String chatString, String toLanguage, String chatId, String spokenBy, String intentModel, Integer currentSentiment, Integer currentPosition){
        //Comment from Neil
        //Second Comment from Neil
        String translation = chatString;
        if (toLanguage != null){
            translation = getChatTranslation(chatString, toLanguage, spokenBy);            
        }
        String intent;
        String sentiment;
        if (spokenBy == 'Customer'){
            intent = getChatIntent(translation, intentModel, spokenBy);
            sentiment = getChatSentiment(translation, spokenBy);
        } else {
            sentiment = getChatSentiment(chatString, spokenBy);
        }
        einsteinplay.Einstein_PredictionResult prediction;
        if (spokenBy == 'Customer'){
            prediction = getChatNER(chatString, spokenBy);
        }
        currentSentiment = (currentSentiment == null ? 0 : currentSentiment);
        Chat_Event__c chatEvent = insertChatEvent(chatId, chatString, spokenBy, translation, intent, sentiment, currentSentiment, currentPosition);
        
        List<Chat_Event_Entity__c> entities = insertChatEventEntities(chatEvent.Id, prediction);
        
        chatEvent = [
            SELECT 	Name, Event_Time__c , Type__c, Transcript__c, Spoken_By__c, 
            		Translation__c, Intent__c, Aggregated_Sentiment__c, Sentiment__c,
            		(SELECT Type__c, Value__c, Confidence__c FROM Chat_Event_Entities__r) 
            FROM 	Chat_Event__c 
            WHERE 	ID =:chatEvent.Id
        ];
        
        //Placeholder for doing NER on chatString
        
        return chatEvent;
    }
    
    @AuraEnabled
    public static List<Chat_Event__c> getPastChatEvents(String chatId){
        System.debug('Chat Id is ' + chatId);
        return [
            SELECT  Name, Event_Time__c , Type__c, Transcript__c, Spoken_By__c, 
                    Translation__c, Intent__c, Aggregated_Sentiment__c, Sentiment__c,
                    (SELECT Type__c, Value__c, Confidence__c FROM Chat_Event_Entities__r) 
            FROM    Chat_Event__c 
            WHERE   Chat_Transcript__c  =: chatId 
            ORDER BY Event_Time__c ASC];
    }

    @AuraEnabled
    public static String getChatTranslation(String chatString, String toLanguage, String spokenBy){
        System.debug('About to translate ' + chatString + ' to language ' + toLanguage);
        String resultString = AITools.MLServices.translate(chatString, toLanguage, 'auto');
        System.debug('Translated ' + resultString);
        return resultString;
    }
    
    @AuraEnabled
    public static String getChatIntent(String chatString, String intentModel, String spokenBy){
        String resultString;
        if (intentModel != ''){
            List<Language.Prediction> intentList = Language.intent(chatString, language.getAccessToken(), intentModel);
            if (intentList.size()>0 && intentList[0].probability > 0.9){
                resultString = intentList[0].label;
            }
        }
        return resultString;
    }
    
    @AuraEnabled
    public static String getChatEntities(String chatString){
        String resultString = '';
        return resultString;
    }
    
    @AuraEnabled
    public static String getChatSentiment(String chatString, String spokenBy){
        String resultString = '';
        List<Language.Prediction> sentimentList = Language.sentiment(chatString, language.getAccessToken(), 'CommunitySentiment');
        if (sentimentList.size()>0){
            resultString = sentimentList[0].label;
        }
        return resultString;
    }
    
    // NER 
    @AuraEnabled
    public static einsteinplay.Einstein_PredictionResult getChatNER(String chatString, String spokenBy){
        String resultString = '';
        String modelId = 'NER7'; 
        einsteinplay.Einstein_PredictionService service = new einsteinplay.Einstein_PredictionService(einsteinplay.Einstein_PredictionService.Types.NER); 
        einsteinplay.Einstein_PredictionResult prediction = service.predictNER(modelId,chatString,3,'');
        return prediction; 
    }
    
    
    @AuraEnabled
    public static Chat_Event__c insertChatEvent(String chatId, String chatTranscript, String spokenBy, String chatTranslation, String chatIntent, String chatSentiment, Integer currentSentiment, Integer currentPosition){
        Chat_Event__c chatEvent = new Chat_Event__c();
        chatEvent.Type__c = 'Speech';
        chatEvent.Chat_Transcript__c = chatId;
        chatEvent.Transcript__c = chatTranscript;
        chatEvent.Spoken_By__c = spokenBy;
        chatEvent.Event_Time__c = DateTime.now();
        chatEvent.Translation__c = chatTranslation;
        chatEvent.Intent__c = chatIntent;
        chatEvent.Position__c = currentPosition;
        
        //Calculate Sentiment
        chatEvent.Sentiment__c = chatSentiment;
        
        if (spokenBy == 'Customer'){
            if (chatSentiment == 'Positive'){
                chatEvent.Aggregated_Sentiment__c = currentSentiment + 1;
            } else if (chatSentiment == 'Negative'){
                chatEvent.Aggregated_Sentiment__c = currentSentiment -1;
            } else {
                chatEvent.Aggregated_Sentiment__c = currentSentiment;
            } 
        } else {
            chatEvent.Aggregated_Sentiment__c = currentSentiment;
        }
        
        insert chatEvent;
        return chatEvent;
    }
    @AuraEnabled
    public static List<Chat_Event_Entity__c> insertChatEventEntities(String eventId, einsteinplay.Einstein_PredictionResult prediction){
        List<Chat_Event_Entity__c> entityList = new List<Chat_Event_Entity__c>();
        for(einsteinplay.Einstein_Probability probability : prediction.probabilities){
            Chat_Event_Entity__c eventEntity = new Chat_Event_Entity__c();
            eventEntity.Type__c = probability.label;
            eventEntity.Value__c = probability.token;
            eventEntity.Confidence__c = probability.probability;
            eventEntity.Chat_Event__c = eventId;
            entityList.add(eventEntity);
        }
        insert entityList;
        return entityList;
    }
    
    
    @AuraEnabled
    public static list<Chat_Event__c> fetchChatEventList(String chatId){
        return [SELECT Name, Event_Time__c , Type__c, Transcript__c, Spoken_By__c, URL__c FROM Chat_Event__c WHERE Chat_Transcript__c =: chatId ORDER BY Event_Time__c ASC];
    }
}