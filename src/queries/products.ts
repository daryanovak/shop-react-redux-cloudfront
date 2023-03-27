import axios, { AxiosError } from "axios";
import csvToJson from 'csvtojson';
import API_PATHS from "~/constants/apiPaths";
import { AvailableProduct } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

// export function useAvailableProducts() { 
//   return useQuery<AvailableProduct[], AxiosError>(
//     "available-products",
//     async () => {
//       const res = await axios.get<AvailableProduct[]>(
//         `${API_PATHS.bff}/product/available`
//       );
//       return res.data;
//     }
//   );
// }

// export function useAvailableProducts() { //task2
//   const fetchProducts = async () => {
//     const response = await fetch(
//       `${API_PATHS.product}/products`
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch products");
//     }
//     return response.json();
//   };

//   return useQuery("products", fetchProducts);
// }


export function useAvailableProducts() {
  const fetchProducts = async () => {
    const authorization_token = localStorage.getItem('authorization_token');
    const headers = {
      'Authorization': `Basic ${authorization_token}`
    };
    try {
      const response = await fetch(`${API_PATHS.product}/import?name=flowers`, { headers });

      if (response.status === 400) {
        alert('Bad request. Please check your input parameters.');
        throw new Error('Bad request');
      } else if (response.status === 401) {
        alert('Unauthorized access. Please check your login credentials.');
        throw new Error('Unauthorized access');
      }

      const url = await response.json();
      const dataResponse = await fetch(url);
      const csvData = await dataResponse.text();
      const jsonData = await csvToJson().fromString(csvData);

      return jsonData;
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again later.');
      throw new Error('Fetch failed');
    }
  };

  return useQuery("products", fetchProducts);
}


export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const res = await axios.get<AvailableProduct>(
        `${API_PATHS.bff}/product/${id}`
      );
      return res.data;
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) =>
    axios.put<AvailableProduct>(`${API_PATHS.bff}/product`, values, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}

export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axios.delete(`${API_PATHS.bff}/product/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}


