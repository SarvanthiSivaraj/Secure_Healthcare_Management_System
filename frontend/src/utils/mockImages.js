// Utility function to get a consistent mock profile image for a doctor
export const mockDoctorImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcXXELTEvMxh3RQa1Y2L8lh3dxpyC0XKB6DBdhQUh6jfh0NGY5FfZC3mvzAEcA4N3d5Q7G3-hcWs4xa1WTMbqieSrOAD09PodKM18Q7-d51ELeCwoPphYfgjCxA_JCZ2Phv5q-VfGyQFO3XKEIUF6WS6mu37o4j1BjjIs994O6PMKoB9hYvNlRf-UUvL7HbRkC2L19WQfwy4oIxBh8mwkxN7VNjq6cHPZqI_rwUNNy9f3d1NPh0_ysg5anCNpqMGV83aP_HxdeNSGa",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBgXVUOz8KimKM03WRDPDtBtnZpI-2NCfe5SYQufeeW7PsAw4y-yrgh_YV-khsVbQMAevgJiCykMtz7jneTV5oT6DMushAqx-mtZNDIgJlUTMVOM4zJTycIvfqUFoyC4VT1V9OhdDJsbbnBt-w3xHM7HoV4DsHT9Pfn3ZcCubxPoBpBWDcMMUROX9Wn5FvvLmpdEc3X9pffl-DMwLXngux4jtHgdkTFGxivrmWx9C0wOxAoBc85ODgzTRiNFULPBHkOF1sFG1w0H2VV",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAH0w4sKMJ-89fppXJJFUFTUZxHvglO7zjvovZ6KPGDC74tVDhyKKDGPU8WRhgNaf3qrk9XeUG8gNH1nDmqIdpfL6WJvScpjUEic1w4YNxo-p9Td5p7BQN49tMUljhzLao-yaoL0PvSbnfbV7iDj-RWEEvJpgAeOLvzmBDxTeE39VHGwf98AqN9aN725VYSQEiZe1OB_8CWGUhNDNCLcUr_qQk4r3Aqypa0duw9z96ar8J8X8EHhf6zLs5n8YghEaYAEoSNHZmw9Tds",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDgi-HQOevy6sAE3ixhZfm_VPiWccB4wVEb23KrHgMFldbX_E2N_0IA_BsQk1wKnMGotSPxqsEh4jOqHDRUN1qRLOIsT8374vfKrfc6Ew91TMq8Qf1Ato9xvStchCwwQQBmapSebY5EEx2kTycUyXjh_GdlRDMFQRD-p7bw5QxrxOWEU98r6OdJjsrdgLlFyPkdQCYAXwM6uSuocMjHqGXtNb9bEAdABYinNaUgUR3Px_GU_nZ9c2L0c7ahGB6YkUa1oGRup8QAqpc5",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC44N57Vb8glHqFOlWs7hErHLCMoMJMClnDP_qXdpvrvWb2Xlt77QQzUHVU8gS5OY4ojw1DrysnX1GbI7nWRfVqNSHCjKHHDEI_JJKJJBI_mqdfEMcuUZyfK9LyLJJpIOmhvwQ6enrfBV1YZpDRDMNeUdy9_7m70nA0yefLsp6ezPcD3eGEPazlFjX2C4yxH98Hix5iXdKhm7RvR4NqAJU6CS6TJ9Y4Bhka-oOc0P3m6CWMnpNf-ectWqb2Ts1VMIHKNtomuviS2N-R",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBJgYtgWP2MODbPMkjteNzalZaJShgUic30geIWo5873G3yiZNaYD0BVXAcgXhTiwmryiYIUVRi4VRyrud_sW9M_4LKrkRIo3LB1KnSgoPLdm9wvSKNRA0mspFvC00a3gzrMB_zjGaAzahN7lAZUSomkwtFsHxfphH5ubu5fHbUzCUYTSVePzci7C03RILcoHZp6zqDKzoq1qYVMaW6fH0TU1p4y3s2jUzaqqpGRmMTAd90AnkASIAsLWzZ2Irrw4x2on0Ycmfymwh",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD3QuXgHm-MjUFgvL23zwRM8tgjJqY_cIU6HJCjXnxHT6y5gBAPbKMHictyQ7EDbWB5z7s_qjhmev4sgpct7UYaMkwwgYdWQ2yHmy01iaJi5Gra8LBCOsbLdxjvYBVDZ4GSChGY8v_MLbAtDwvwXyDjvq4FmxSBZXMkd5XiaOWlsgSPwhv58n47DS5045itVHKzXKiQYxVswJRVppvichh9Cq2-0PA0OuD6hdXUJhOHLBontl8pLO00JowXlWOH8RPbunA4GLmNhZ_d",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDMP1AF2TvRQbNe6o2n2w2gaiyo7wsWuBBdb7jSNr57VGftMFhfpQ2IaqUyRlWvQi-VXAEkbS6WqHOxOZAw76DcVFjuWLHvChS3AGhQhlZpCa66hjeaDVj5jcYG2L36s87lEwufiBrU2o3KBxPH-Ynfiz7Jcl4VobYeGy9nL8pFN4Xw5SKMyT7Jz3Ck0OffKQbGbbGna14_spsiNydNcrVWIJMipnQSNeBn2isBmr3rLPm1tKp59pfOVI0DPuHITGs3iPSVMnw0GiaN"
];

export const getDoctorMockImage = (doctorId) => {
    if (!doctorId) return mockDoctorImages[0];

    // Create a simple consistent hash from the doctor string/number ID
    const strId = String(doctorId);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
        hash = ((hash << 5) - hash) + strId.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    // Ensure positive index
    const index = Math.abs(hash) % mockDoctorImages.length;
    return mockDoctorImages[index];
};
