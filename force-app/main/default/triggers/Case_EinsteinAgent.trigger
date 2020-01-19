trigger Case_EinsteinAgent on Case (after insert, after update) {    
    for(Case c: Trigger.new){
        EinsteinAgentTriggerHelper.createRecommendations(c.Id);
    }
}