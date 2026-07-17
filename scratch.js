const fs = require('fs');

const singlyCode = fs.readFileSync('src/core/linked-list/SinglyLinkedList.ts', 'utf8');

let doublyCode = singlyCode
  .replace(/SinglyLinkedList/g, 'DoublyLinkedList')
  .replace(/SinglyListSnapshot/g, 'DoublyListSnapshot')
  .replace(/ListNode/g, 'DoublyListNode')
  .replace(/LL_INSERT_HEAD/g, 'DLL_INSERT_HEAD')
  .replace(/LL_INSERT_TAIL/g, 'DLL_INSERT_TAIL')
  .replace(/LL_INSERT_AT/g, 'DLL_INSERT_AT')
  .replace(/LL_DELETE_HEAD/g, 'DLL_DELETE_HEAD')
  .replace(/LL_DELETE_TAIL/g, 'DLL_DELETE_TAIL')
  .replace(/LL_DELETE_AT/g, 'DLL_DELETE_AT')
  .replace(/LL_SEARCH/g, 'DLL_SEARCH');

fs.writeFileSync('src/core/linked-list/DoublyLinkedList.ts', doublyCode);
