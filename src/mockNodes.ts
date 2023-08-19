export const nodes = [
  {
    value: 'root',
    label: 'root',
    checked: true,
    children: [
      {
        value: 'potato',
        label: 'Potato',
        children: [
          { value: 'bird', label: 'Bird' },
          { value: 'cat', label: 'Cat' },
          {
            value: 'dog',
            label: 'Dog',
            children: [
              {
                value: 'Human',
                label: 'human',
                children: [
                  {
                    value: 'xxx',
                    label: 'xxx',
                    children: [
                      {
                        value: 'yyy',
                        label: 'yyy',
                        children: [
                          ...new Array(300).fill(0).map((value, index) => {
                            return {
                              value: `xxx-yyy-${index}`,
                              label: `xxx-yyy-${index}`,
                            };
                          }),
                        ],
                      },
                    ],
                  },
                ],
              },
              ...new Array(100).fill(0).map((value, index) => {
                return {
                  value: `human-${index}`,
                  label: `human-${index}`,
                };
              }),
            ],
          },
        ],
      },
      {
        value: 'apple',
        label: 'Apple',
      },
    ],
  },
];
