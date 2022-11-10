import { KnownBlock, Block, View } from '@slack/bolt';
import conditions from '../src/lambda/questions/conditional.json';
import result from './result-block.json';
import questions from './static-test.json';

describe('questions', () => {
  it('should loop over questions', () => {
    console.log(result);
    const foo = questions.map(quest => {
      let element = {
        placeholder: quest.element?.placeholder,
        type: quest.element?.type,
        options: quest.element?.options,
      };
      const options = quest.element?.options?.map(option => {
        if (option.value in conditions) {
          return Object(conditions)[option.value];
        } else {
          return [];
        }
      });
      element.options = options;
      return {
        type: quest.type,
        element: element,
        label: quest.label,
      };
    });
    console.log(foo);

    const blocks: (KnownBlock | Block)[] = foo;
    const view: View = {
      type: 'modal',
      submit: {
        type: 'plain_text',
        text: 'Submit',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      title: {
        type: 'plain_text',
        text: 'Sprint Bot',
        emoji: true,
      },
      blocks,
    };
    expect(view).toEqual(result);
  });
});