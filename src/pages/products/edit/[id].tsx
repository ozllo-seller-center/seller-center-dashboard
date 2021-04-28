// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { GetStaticPaths, GetStaticProps } from "next";

// import styles from './edit.module.scss';

// export function ProductEdit({ }) {
//   return (
//     <div>

//     </div>
//   );
// };


// type ApiSummaryDTO = {
//   item: {
//     id: any;
//   }
// }

// const apiSummary: ApiSummaryDTO[] = [
//   {
//     item: {
//       id: '1'
//     }
//   },
//   {
//     item: {
//       id: '2'
//     }
//   },
//   {
//     item: {
//       id: '3'
//     }
//   },
//   {
//     item: {
//       id: '4'
//     }
//   },
//   {
//     item: {
//       id: '5'
//     }
//   },
//   {
//     item: {
//       id: '6'
//     }
//   },
// ];

// export const getStaticPaths: GetStaticPaths = async () => {
//   const response = await fetch('https://api.github.com/orgs/rocketseat/members');
//   const data = await response.json();

//   const paths = apiSummary.map(i => {
//     return { params: { id: i.item.id } }
//   });

//   return {
//     paths,
//     fallback: true,
//   }
// }

// export const getStaticProps: GetStaticProps = async (context) => {
//   const { id } = context.params;

//   // const response = await fetch(`https://api.github.com/users/${login}`);
//   // const data = await response.json();

//   const data = apiSummary[id]

//   return {
//     props: {
//       user: data,
//     },
//     revalidate: 10
//   }
// }

import React from 'react';

function ProductEdit({ }) {
  return (
    <div>

    </div>
  );
};

export default ProductEdit;
