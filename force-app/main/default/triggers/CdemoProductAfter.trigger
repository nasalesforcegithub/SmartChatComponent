trigger CdemoProductAfter on Product2 (after insert, after update) {
    if(trigger.isAfter && !Test.isRunningTest() && trigger.new.size()<50){
        ProductUtility.AfterTriggerProcessor(Trigger.new, Trigger.isInsert);
    }
}