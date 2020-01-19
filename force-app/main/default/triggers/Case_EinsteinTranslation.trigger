trigger Case_EinsteinTranslation on Case (before insert) {
    for(Case c: Trigger.new){
		String resultString = AITools.MLServices.translate(c.subject, 'en', 'auto');
        c.Translation__c = resultString;       
    }
}