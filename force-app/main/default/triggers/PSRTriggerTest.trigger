trigger PSRTriggerTest on PendingServiceRouting (before insert) {
    for(PendingServiceRouting psr: Trigger.new){
		psr.DropAdditionalSkillsTimeout = 30;
        psr.CapacityWeight = 5;
    }
}