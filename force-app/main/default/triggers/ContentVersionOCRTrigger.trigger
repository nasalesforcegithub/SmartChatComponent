trigger ContentVersionOCRTrigger on ContentVersion (after insert) {

    ContentVersionOCRUtil.ocrAndSaveToField(trigger.new[0].Id);
    
}