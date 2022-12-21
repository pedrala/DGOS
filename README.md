# DGOS
 token reward transfer scheduler

Supply Wallet -> DGOS Wallet 
DGOS Wallet -> NFT Node Wallet

1.UTC 기준 6시간 주기로 정각 2분전에 공급지갑에서 DGOS Wallet 으로 토큰 미리 전송
2.정각에 각 노드의 어카운트ID 를 기준으로 알파벳순으로 정렬된 노드에 6초간격으로 전송함.
*전송 시간 간격이 짧거나 네트워크 상태가 불안정한 경우 전송 오류 이슈가 있음)

===========================CLI Command=========================

    //send tkn fromSupplW todgosW manually
    send_tkn_fromSupplyW_todgosW :       'send supply2dgos', 
    send_tkn_fromDgosW_toNFTnodeW :      'send dgos2node',  //ex) send dgos2node GAIA 
    
    //send tokens at once for past days until current time 
    send_dgos2node_atonce :         'send atoncedgos2node',

    //start/stop 6H timer for supply2dgos
    start_timer_supply2dgos :      'stt supply2dgos',  
    stop_timer_supply2dgo :        'stp supply2dgos',

    //start/stop 6H timer for dgos2node
    start_timer_dgos2node :        'stt dgos2node',
    stop_timer_dgos2node :         'stp dgos2node',   

    //check remained time for next sending
    check_remainedtime_supply2dgos :      'check supply2dgos',
    check_remainedtime_dgos2node :        'check dgos2node',   
